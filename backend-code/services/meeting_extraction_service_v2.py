import openai
import json
import time
import traceback
from datetime import datetime
from services.document_processor import DocumentProcessor
from config import OPENAI_CONFIG

# Configure OpenAI for Azure GPT-4
openai.api_type = "azure"
openai.api_base = OPENAI_CONFIG['azure_endpoint']
openai.api_version = OPENAI_CONFIG['api_version']
openai.api_key = OPENAI_CONFIG['api_key']


class MeetingExtractionServiceV2:
    def __init__(self, db_manager):
        self.db_manager = db_manager
        self.doc_processor = DocumentProcessor()
        self.deployment = OPENAI_CONFIG['deployment']
        self.max_tokens = OPENAI_CONFIG['max_tokens']
        self.temperature = OPENAI_CONFIG['temperature']
        self.top_p = OPENAI_CONFIG['top_p']

    def process_meeting_files(self, meeting_id, workspace_id, org_id):
        """
        Process all files for a meeting and extract insights
        """
        try:
            # Get all files for the meeting with their content from the unified files table
            files_query = '''
                SELECT f.*, mf.meeting_id 
                FROM files f
                JOIN meeting_files mf ON f.file_name = mf.file_name 
                    AND f.workspace_id = mf.workspace_id
                WHERE mf.meeting_id = ? AND mf.org_id = ? AND f.status = 'uploaded' 
                    AND mf.status = 'uploaded'
            '''
            files = self.db_manager.fetch_all(
                files_query,
                (meeting_id, org_id)
            )

            if not files:
                return {'status': 'no_files', 'message': 'No files to process'}

            # Extract text from all files using stored content
            combined_text = ""
            for file in files:
                try:
                    # Use file content from database and file extension
                    file_content = file['file_content']
                    file_extension = file['file_extension'].lstrip('.') if file['file_extension'] else ''
                    
                    if file_content:
                        file_text = self.doc_processor.extract_text(file_content, file_extension)
                        combined_text += f"\n\n--- File: {file['file_name']} ---\n\n{file_text}"
                    else:
                        print(f"Warning: No content found for file {file['file_name']}")
                except Exception as e:
                    print(f"Error extracting text from {file['file_name']}: {str(e)}")
                    traceback.print_exc()

            if not combined_text.strip():
                return {'status': 'no_text', 'message': 'No text extracted from files'}

            # Call LLM for extraction
            extraction_result = self._call_llm_for_extraction(combined_text)

            if not extraction_result:
                return {'status': 'extraction_failed', 'message': 'LLM extraction failed'}

            # Store extractions in consolidated database
            self._store_extractions(meeting_id, workspace_id, org_id, extraction_result)

            return {
                'status': 'success',
                'message': 'Extractions completed successfully',
                'extraction_counts': self._count_extractions(extraction_result)
            }

        except Exception as e:
            print(f"Error processing meeting files: {str(e)}")
            traceback.print_exc()
            return {'status': 'error', 'message': str(e)}

    def _call_llm_for_extraction(self, text):
        """Call Azure OpenAI GPT-5 Mini for extraction"""
        try:
            start_time = time.time()
            
            prompt = self._build_extraction_prompt(text)

            # Prepare messages for API call
            messages = [
                {
                    "role": "system",
                    "content": "You are an expert analyst for Salesforce implementation discovery, design, and build."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]

            # Call Azure OpenAI API
            response = openai.ChatCompletion.create(
                engine=self.deployment,
                messages=messages,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                top_p=self.top_p
            )

            end_time = time.time()
            latency_ms = int((end_time - start_time) * 1000)

            # Extract response content
            response_content = response.choices[0].message.content
            tokens_used = response.usage.total_tokens

            print(f"LLM Response received in {latency_ms}ms, tokens: {tokens_used}")

            # Parse JSON response
            try:
                extraction_data = json.loads(response_content)
                return extraction_data
            except json.JSONDecodeError as e:
                print(f"Error parsing LLM response as JSON: {str(e)}")
                # Handle Unicode characters in response for Windows console
                try:
                    print(f"Raw response (first 500 chars): {response_content[:500]}")
                except UnicodeEncodeError:
                    print("Raw response contains Unicode characters that can't be displayed in console")
                return None

        except Exception as e:
            print(f"Error calling LLM: {str(e)}")
            traceback.print_exc()
            return None

    def _build_extraction_prompt(self, text):
        """Build the extraction prompt for LLM"""
        prompt = f"""
        Analyze the following meeting transcript and extract structured information for implementation discovery.

        Meeting Content:
        {text}

        Please extract the following information and return as JSON:

        1. Document Metadata (V0):
        - source_type: Type of source document
        - doc_title: Document title
        - extraction_timestamp: When extraction was performed
        - confidence: Confidence level (0-1)

        2. Business Units and Teams (V1):
        - business_unit: Name of business unit
        - teams: Array of team names
        - notes_md: Additional notes in markdown

        3. Modules and Processes (V2):
        - module_name: Name of Salesforce module
        - processes: Array of process names
        - scope_tag: Scope identifier
        - notes_md: Additional notes in markdown

        4. License List (V3):
        - license_type: Type of license
        - count: Number of licenses
        - allocation_md: Allocation details in markdown
        - notes_md: Additional notes in markdown

        5. Personas (V4):
        - persona_name: Name of persona
        - responsibilities: Array of responsibilities
        - primary_modules: Array of primary modules
        - status: Status of persona

        6. Requirements (V5):
        - requirement_type: Type of requirement
        - description_md: Description in markdown
        - acceptance_criteria: Array of acceptance criteria
        - status: Status of requirement

        7. Risks and Issues (V6):
        - type: Type of risk/issue
        - description_md: Description in markdown
        - impact_md: Impact description in markdown
        - mitigation_md: Mitigation strategy in markdown
        - owner_md: Owner information in markdown
        - due_date: Due date

        8. Action Items (V7):
        - task_md: Task description in markdown
        - owner_md: Owner information in markdown
        - due_date: Due date
        - item_status: Status of action item

        9. Decisions (V8):
        - decision_md: Decision description in markdown
        - rationale_md: Rationale in markdown
        - decided_on: Date decision was made
        - approver_md: Approver information in markdown

        10. Dependencies (V9):
        - description_md: Dependency description in markdown
        - type: Type of dependency
        - depends_on_md: What it depends on in markdown
        - owner_md: Owner information in markdown

        11. Pain Points (V10):
        - pain_point_md: Pain point description in markdown
        - affected_bu_md: Affected business units in markdown
        - impact_md: Impact description in markdown

        12. Current State (V11):
        - description_md: Current state description in markdown

        13. Target State (V12):
        - description_md: Target state description in markdown

        14. Integrations (V13):
        - application_name: Name of application to integrate
        - purpose_md: Purpose in markdown
        - integration_type: Type of integration
        - directionality: Direction of integration
        - notes_md: Additional notes in markdown

        15. Data Migration (V14):
        - source_md: Source information in markdown
        - mapping_notes_md: Mapping notes in markdown
        - cleansing_rules_md: Cleansing rules in markdown
        - tools_md: Tools information in markdown

        16. Data Model (V15):
        - entity_name: Name of entity
        - entity_type: Type of entity
        - key_fields: Array of key fields
        - relationships_md: Relationships in markdown

        17. Metadata Updates (V16):
        - component_type: Type of component
        - api_name_md: API name in markdown
        - change_type: Type of change
        - scope_md: Scope in markdown

        18. Scope Summary (V17):
        - in_scope_md: In-scope items in markdown
        - out_of_scope_md: Out-of-scope items in markdown
        - future_phase_md: Future phase items in markdown

        19. Assumptions and Gaps (V18):
        - note_md: Assumption or gap note in markdown

        20. Source References (V19):
        - reference_md: Reference information in markdown

        21. Validation Summary (V20):
        - json_validity: Whether JSON is valid (boolean)
        - issues_detected: Array of detected issues

        Return the data as a valid JSON object with arrays for each category. If no data is found for a category, return an empty array.
        
        IMPORTANT: Your response must be valid JSON only. Do not include any explanatory text, markdown formatting, or code blocks. Start your response with {{ and end with }}.
        """

        return prompt

    def _store_extractions(self, meeting_id, workspace_id, org_id, data):
        """Store all extractions in consolidated database table"""
        try:
            # Define extraction type mappings
            extraction_mappings = {
                'document_metadata': 'metadata',
                'V1_list_of_bu_teams': 'bu_teams',
                'V2_modules_and_processes': 'modules_processes',
                'V3_license_list': 'licenses',
                'V4_personas': 'personas',
                'V5_requirements': 'requirements',
                'V6_risks_issues': 'risks_issues',
                'V7_action_items': 'action_items',
                'V8_decisions': 'decisions',
                'V9_dependencies': 'dependencies',
                'V10_pain_points': 'pain_points',
                'V11_current_state': 'current_state',
                'V12_target_state': 'target_state',
                'V13_integrations': 'integrations',
                'V14_data_migration': 'data_migration',
                'V15_data_model': 'data_model',
                'V16_metadata_updates': 'metadata_updates',
                'V17_scope_summary': 'scope_summary',
                'V18_assumptions_gaps': 'assumptions_gaps',
                'V19_source_references': 'source_references',
                'V20_validation_summary': 'validation_summary'
            }

            for data_key, extraction_type in extraction_mappings.items():
                if data_key in data and data[data_key]:
                    for item in data[data_key]:
                        self._insert_extraction_item(
                            meeting_id, workspace_id, org_id, extraction_type, item
                        )

        except Exception as e:
            print(f"Error storing extractions: {str(e)}")
            traceback.print_exc()

    def _insert_extraction_item(self, meeting_id, workspace_id, org_id, extraction_type, item):
        """Insert a single extraction item into the consolidated table"""
        try:
            # Convert item to JSON string
            data_json = json.dumps(item)
            
            query = '''
                INSERT INTO extraction_data 
                (meeting_id, workspace_id, org_id, extraction_type, data_json, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            '''
            
            self.db_manager.execute_query(
                query, 
                (meeting_id, workspace_id, org_id, extraction_type, data_json, datetime.now())
            )

        except Exception as e:
            print(f"Error inserting extraction item: {str(e)}")
            traceback.print_exc()

    def _count_extractions(self, data):
        """Count number of items in each extraction category"""
        counts = {}
        for key in data.keys():
            if isinstance(data[key], list):
                counts[key] = len(data[key])
        return counts

    def get_meeting_extractions(self, meeting_id, org_id):
        """Retrieve all extractions for a meeting from consolidated table"""
        try:
            query = '''
                SELECT extraction_type, data_json, created_at
                FROM extraction_data
                WHERE meeting_id = ? AND org_id = ? AND status = 'active'
                ORDER BY extraction_type, created_at
            '''
            
            results = self.db_manager.fetch_all(query, (meeting_id, org_id))
            
            # Group by extraction type
            extractions = {}
            for row in results:
                extraction_type = row['extraction_type']
                data_json = row['data_json']
                created_at = row['created_at']
                
                try:
                    # Parse JSON data
                    item_data = json.loads(data_json)
                    
                    # Add metadata
                    item_data['_id'] = f"{extraction_type}_{created_at}"
                    item_data['_created_at'] = created_at
                    
                    if extraction_type not in extractions:
                        extractions[extraction_type] = []
                    
                    extractions[extraction_type].append(item_data)
                    
                except json.JSONDecodeError as e:
                    print(f"Error parsing JSON for {extraction_type}: {str(e)}")
                    continue
            
            return extractions

        except Exception as e:
            print(f"Error getting meeting extractions: {str(e)}")
            traceback.print_exc()
            return {}

    def get_extraction_by_type(self, meeting_id, org_id, extraction_type):
        """Get specific extraction type for a meeting"""
        try:
            query = '''
                SELECT data_json, created_at
                FROM extraction_data
                WHERE meeting_id = ? AND org_id = ? AND extraction_type = ? AND status = 'active'
                ORDER BY created_at
            '''
            
            results = self.db_manager.fetch_all(query, (meeting_id, org_id, extraction_type))
            
            items = []
            for row in results:
                try:
                    item_data = json.loads(row['data_json'])
                    item_data['_id'] = f"{extraction_type}_{row['created_at']}"
                    item_data['_created_at'] = row['created_at']
                    items.append(item_data)
                except json.JSONDecodeError as e:
                    print(f"Error parsing JSON for {extraction_type}: {str(e)}")
                    continue
            
            return items

        except Exception as e:
            print(f"Error getting extraction by type: {str(e)}")
            traceback.print_exc()
            return []

    def delete_extraction_item(self, meeting_id, org_id, extraction_type, item_id):
        """Delete a specific extraction item"""
        try:
            query = '''
                UPDATE extraction_data 
                SET status = 'deleted', updated_at = ?
                WHERE meeting_id = ? AND org_id = ? AND extraction_type = ? 
                AND id = ?
            '''
            
            self.db_manager.execute_query(
                query, 
                (datetime.now(), meeting_id, org_id, extraction_type, item_id)
            )
            
            return True

        except Exception as e:
            print(f"Error deleting extraction item: {str(e)}")
            traceback.print_exc()
            return False

    def update_extraction_item(self, meeting_id, org_id, extraction_type, item_id, updated_data):
        """Update a specific extraction item"""
        try:
            data_json = json.dumps(updated_data)
            
            query = '''
                UPDATE extraction_data 
                SET data_json = ?, updated_at = ?
                WHERE meeting_id = ? AND org_id = ? AND extraction_type = ? 
                AND id = ? AND status = 'active'
            '''
            
            self.db_manager.execute_query(
                query, 
                (data_json, datetime.now(), meeting_id, org_id, extraction_type, item_id)
            )
            
            return True

        except Exception as e:
            print(f"Error updating extraction item: {str(e)}")
            traceback.print_exc()
            return False
