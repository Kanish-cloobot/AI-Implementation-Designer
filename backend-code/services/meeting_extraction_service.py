import openai
import json
import time
import traceback
from datetime import datetime
from services.document_processor import DocumentProcessor
from services.unified_extraction_service import UnifiedExtractionService
from config import OPENAI_CONFIG

# Configure OpenAI for Azure GPT-4
openai.api_type = "azure"
openai.api_base = OPENAI_CONFIG['azure_endpoint']
openai.api_version = OPENAI_CONFIG['api_version']
openai.api_key = OPENAI_CONFIG['api_key']


class MeetingExtractionService:
    def __init__(self, db_manager):
        self.db_manager = db_manager
        self.doc_processor = DocumentProcessor()
        self.unified_extraction_service = UnifiedExtractionService(db_manager)
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

            # Store extractions in database
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

            # Calculate latency
            latency_ms = int((time.time() - start_time) * 1000)

            # Extract the response content
            response_text = response.choices[0].message.content.strip()

            # Get token usage
            tokens_used = response.get('usage', {}).get('total_tokens', 0)

            print(f"Azure OpenAI GPT-5 Mini call successful - Tokens: {tokens_used}, Latency: {latency_ms}ms")

            # Extract JSON from markdown code fence
            json_text = self._extract_json_from_markdown(response_text)

            # Parse JSON
            extraction_data = json.loads(json_text)

            return extraction_data

        except openai.error.InvalidRequestError as e:
            print(f"Invalid request to Azure OpenAI: {str(e)}")
            traceback.print_exc()
            return None
        
        except openai.error.AuthenticationError as e:
            print(f"Authentication error with Azure OpenAI: {str(e)}")
            traceback.print_exc()
            return None
        
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON from LLM response: {str(e)}")
            traceback.print_exc()
            return None

        except Exception as e:
            print(f"Error calling LLM: {str(e)}")
            traceback.print_exc()
            return None

    def _build_extraction_prompt(self, text):
        """Build the extraction prompt"""
        prompt = f"""Objective
You are an expert analyst for Salesforce implementation discovery, design, and build.
Given an input (meeting transcript, SoW, contract, notes), extract exactly the 16 value groups (V1–V16) listed below.
Your output must be one valid JSON object only, wrapped in Markdown code fences.
Each value must be a list of JSON objects, and all related attributes must be encapsulated within those objects.

Denoising & Relevance Rules
- Only extract content relevant to Salesforce discovery/design/build (scope, modules, roles, licenses, integrations, data, metadata, risks/issues, decisions, etc.).
- Ignore unrelated details such as greetings, small talk, boilerplate, pricing, or legal terms.
- If multiple domains are present, focus on Salesforce CRM context and ignore unrelated project areas.
- If a value is missing, leave the array empty and describe the gap in assumptions_and_gaps.

Output Requirements
- Output must be a single JSON object, enclosed in triple backticks (```json ... ```).
- Each V1-V16 key must contain a list of JSON objects.
- All text content should be written as Markdown within string values.
- Use double-quoted keys, properly escaped strings, and no trailing commas.
- Each array must exist even if empty.
- IMPORTANT: Generate as many as possible items for each V1-V16 key, especially for V5_requirements.

JSON Structure Required:
{{
  "document_metadata": [{{
    "source_type": "transcript | SoW | contract",
    "doc_title": "document title if known",
    "extraction_timestamp": "YYYY-MM-DD",
    "confidence": 0.0
  }}],
  "V1_list_of_bu_teams": [{{
    "business_unit": "business unit name",
    "teams": ["team name 1", "team name 2"],
    "notes_md": "additional notes"
  }}],
  "V2_modules_and_processes": [{{
    "module_name": "module name",
    "processes": ["process 1", "process 2"],
    "scope_tag": "in-scope | out-of-scope | future-phase",
    "notes_md": "short description"
  }}],
  "V3_license_list": [{{
    "license_type": "Sales Cloud, Service Cloud, Platform, etc.",
    "count": 0,
    "allocation_md": "allocation details",
    "notes_md": "notes"
  }}],
  "V4_personas": [{{
    "persona_name": "e.g., Sales Manager",
    "responsibilities": ["task 1", "task 2"],
    "primary_modules": ["module 1", "module 2"]
  }}],
  "V5_requirements": [{{
    "requirement_type": "functional | non-functional",
    "description_md": "short description",
    "acceptance_criteria": ["criterion 1", "criterion 2"]
  }}],
  "V6_risks_and_issues": [{{
    "type": "risk | issue",
    "description_md": "description",
    "impact_md": "impact details",
    "mitigation_md": "mitigation plan",
    "owner_md": "owner or team",
    "due_date": "YYYY-MM-DD or empty string"
  }}],
  "V7_action_items": [{{
    "task_md": "action task",
    "owner_md": "responsible person",
    "due_date": "YYYY-MM-DD or empty string",
    "status": "open | in-progress | done"
  }}],
  "V8_decisions": [{{
    "decision_md": "what was decided",
    "rationale_md": "reasoning",
    "decided_on": "YYYY-MM-DD or empty string",
    "approver_md": "approver"
  }}],
  "V9_dependencies": [{{
    "description_md": "dependency details",
    "type": "internal | external",
    "depends_on_md": "related system/team",
    "owner_md": "responsible entity"
  }}],
  "V10_pain_points": [{{
    "pain_point_md": "problem statement",
    "affected_bu_md": "affected business unit",
    "impact_md": "business or process impact"
  }}],
  "V11_current_state_as_is": [{{
    "description_md": "paragraph(s) describing current processes and tools"
  }}],
  "V12_target_state_to_be": [{{
    "description_md": "paragraph(s) describing desired Salesforce-enabled future state"
  }}],
  "V13_applications_to_be_integrated": [{{
    "application_name": "app name (QuickBooks, DocuSign, etc.)",
    "purpose_md": "purpose of integration",
    "integration_type": "native | OOTB | third-party | custom",
    "directionality": "unidirectional | bidirectional",
    "notes_md": "notes"
  }}],
  "V14_data_migration": [{{
    "source_md": "data sources (Excel, legacy CRM)",
    "mapping_notes_md": "key field mapping details",
    "cleansing_rules_md": "cleansing rules",
    "tools_md": ["tool name"]
  }}],
  "V15_data_model": [{{
    "entity_name": "object/entity name",
    "entity_type": "standard | custom",
    "key_fields": ["key field 1", "key field 2"],
    "relationships_md": "relationships between entities"
  }}],
  "V16_metadata_to_update": [{{
    "component_type": "Object | Field | Flow | Apex | Layout | Profile | Report | Dashboard | LWC | Other",
    "api_name_md": "API name or short identifier",
    "change_type": "create | update | deprecate",
    "scope_md": "reason or context for change"
  }}],
  "scope_summary": [{{
    "in_scope_md": ["in-scope item"],
    "out_of_scope_md": ["out-of-scope item"],
    "future_phase_md": ["deferred or future-phase item"]
  }}],
  "assumptions_and_gaps": [{{
    "note_md": "any inferred assumption or missing information description"
  }}],
  "source_references": [{{
    "reference_md": "source section or quote reference"
  }}],
  "validation_summary": [{{
    "json_validity": true,
    "issues_detected": ["issue 1", "issue 2"]
  }}]
}}

Validation Checklist
- One JSON object only, wrapped in json code fences.
- Each key (V1–V16) is an array of objects, even if empty.
- All strings are properly escaped, all keys double-quoted.
- No trailing commas or null values.
- Markdown formatting lives inside string values.
- Dates follow YYYY-MM-DD.
- Denoising applied – only Salesforce-relevant content extracted.

Assumptions Policy
- Infer carefully; log all assumptions under assumptions_and_gaps.
- Never fabricate personal data; use generic role placeholders.
- Leave arrays empty for missing data and record the gap.

INPUT DOCUMENT(S):
{text}

Final Instruction
Perform extraction now and return only the JSON object above, enclosed within json code fences.
"""
        return prompt

    def _extract_json_from_markdown(self, response_text):
        """Extract JSON from markdown code fence"""
        # Find JSON within ```json ... ``` or ``` ... ```
        if '```json' in response_text:
            start = response_text.find('```json') + 7
            end = response_text.find('```', start)
            return response_text[start:end].strip()
        elif '```' in response_text:
            start = response_text.find('```') + 3
            end = response_text.find('```', start)
            return response_text[start:end].strip()
        else:
            return response_text.strip()

    def _store_extractions(self, meeting_id, workspace_id, org_id, data):
        """Store all extractions in unified table"""
        try:
            # Transform the data to match the unified structure
            unified_data = self._transform_to_unified_format(data)
            
            # Store using unified extraction service
            self.unified_extraction_service.store_unified_extraction(
                meeting_id=meeting_id,
                workspace_id=workspace_id,
                org_id=org_id,
                extraction_data=unified_data,
                created_by='system'
            )
            
            print(f"Successfully stored unified extraction for meeting {meeting_id}")
            
        except Exception as e:
            print(f"Error storing extractions: {str(e)}")
            traceback.print_exc()

    def _transform_to_unified_format(self, data):
        """Transform extraction data to unified format"""
        unified_data = {
            'source_type': '',
            'doc_title': '',
            'extraction_timestamp': datetime.now().isoformat(),
            'confidence': 0.0,
            'bu_teams': [],
            'modules_processes': [],
            'licenses': [],
            'personas': [],
            'requirements': [],
            'risks_issues': [],
            'action_items': [],
            'decisions': [],
            'dependencies': [],
            'pain_points': [],
            'current_state': [],
            'target_state': [],
            'integrations': [],
            'data_migration': [],
            'data_model': [],
            'metadata_updates': [],
            'scope_summary': [],
            'assumptions_gaps': [],
            'source_references': [],
            'validation_summary': {}
        }
        
        # Transform document metadata
        if 'document_metadata' in data and data['document_metadata']:
            metadata = data['document_metadata'][0]
            unified_data['source_type'] = metadata.get('source_type', '')
            unified_data['doc_title'] = metadata.get('doc_title', '')
            unified_data['extraction_timestamp'] = metadata.get('extraction_timestamp', datetime.now().isoformat())
            unified_data['confidence'] = metadata.get('confidence', 0.0)
        
        # Transform V1: BU/Teams
        if 'V1_list_of_bu_teams' in data:
            unified_data['bu_teams'] = data['V1_list_of_bu_teams']
        
        # Transform V2: Modules and Processes
        if 'V2_modules_and_processes' in data:
            unified_data['modules_processes'] = data['V2_modules_and_processes']
        
        # Transform V3: Licenses
        if 'V3_license_list' in data:
            unified_data['licenses'] = data['V3_license_list']
        
        # Transform V4: Personas
        if 'V4_personas' in data:
            unified_data['personas'] = data['V4_personas']
        
        # Transform V5: Requirements
        if 'V5_requirements' in data:
            unified_data['requirements'] = data['V5_requirements']
        
        # Transform V6: Risks and Issues
        if 'V6_risks_and_issues' in data:
            unified_data['risks_issues'] = data['V6_risks_and_issues']
        
        # Transform V7: Action Items
        if 'V7_action_items' in data:
            unified_data['action_items'] = data['V7_action_items']
        
        # Transform V8: Decisions
        if 'V8_decisions' in data:
            unified_data['decisions'] = data['V8_decisions']
        
        # Transform V9: Dependencies
        if 'V9_dependencies' in data:
            unified_data['dependencies'] = data['V9_dependencies']
        
        # Transform V10: Pain Points
        if 'V10_pain_points' in data:
            unified_data['pain_points'] = data['V10_pain_points']
        
        # Transform V11: Current State
        if 'V11_current_state_as_is' in data:
            unified_data['current_state'] = data['V11_current_state_as_is']
        
        # Transform V12: Target State
        if 'V12_target_state_to_be' in data:
            unified_data['target_state'] = data['V12_target_state_to_be']
        
        # Transform V13: Integrations
        if 'V13_applications_to_be_integrated' in data:
            unified_data['integrations'] = data['V13_applications_to_be_integrated']
        
        # Transform V14: Data Migration
        if 'V14_data_migration' in data:
            unified_data['data_migration'] = data['V14_data_migration']
        
        # Transform V15: Data Model
        if 'V15_data_model' in data:
            unified_data['data_model'] = data['V15_data_model']
        
        # Transform V16: Metadata Updates
        if 'V16_metadata_to_update' in data:
            unified_data['metadata_updates'] = data['V16_metadata_to_update']
        
        # Transform Scope Summary
        if 'scope_summary' in data:
            unified_data['scope_summary'] = data['scope_summary']
        
        # Transform Assumptions and Gaps
        if 'assumptions_and_gaps' in data:
            unified_data['assumptions_gaps'] = data['assumptions_and_gaps']
        
        # Transform Source References
        if 'source_references' in data:
            unified_data['source_references'] = data['source_references']
        
        # Transform Validation Summary
        if 'validation_summary' in data and data['validation_summary']:
            unified_data['validation_summary'] = data['validation_summary'][0]
        
        return unified_data


    def _count_extractions(self, data):
        """Count number of items in each extraction category"""
        counts = {}
        for key in data.keys():
            if isinstance(data[key], list):
                counts[key] = len(data[key])
        return counts

    def get_meeting_extractions(self, meeting_id, org_id):
        """Retrieve all extractions for a meeting from unified table"""
        try:
            # Get unified extraction data
            extraction_data = self.unified_extraction_service.get_unified_extraction(meeting_id, org_id)
            
            if not extraction_data:
                return {}
            
            # Return the extraction data in the expected format
            # Handle cases where data might be objects instead of arrays
            def ensure_array(data):
                if data is None:
                    return []
                if isinstance(data, dict):
                    return [data]
                if isinstance(data, list):
                    return data
                return []
            
            return {
                'bu_teams': ensure_array(extraction_data.get('bu_teams')),
                'modules_processes': ensure_array(extraction_data.get('modules_processes')),
                'licenses': ensure_array(extraction_data.get('licenses')),
                'personas': ensure_array(extraction_data.get('personas')),
                'requirements': ensure_array(extraction_data.get('requirements')),
                'risks_issues': ensure_array(extraction_data.get('risks_issues')),
                'action_items': ensure_array(extraction_data.get('action_items')),
                'decisions': ensure_array(extraction_data.get('decisions')),
                'dependencies': ensure_array(extraction_data.get('dependencies')),
                'pain_points': ensure_array(extraction_data.get('pain_points')),
                'current_state': ensure_array(extraction_data.get('current_state')),
                'target_state': ensure_array(extraction_data.get('target_state')),
                'integrations': ensure_array(extraction_data.get('integrations')),
                'data_migration': ensure_array(extraction_data.get('data_migration')),
                'data_model': ensure_array(extraction_data.get('data_model')),
                'metadata_updates': ensure_array(extraction_data.get('metadata_updates')),
                'scope_summary': ensure_array(extraction_data.get('scope_summary')),
                'assumptions_gaps': ensure_array(extraction_data.get('assumptions_gaps')),
                'source_references': ensure_array(extraction_data.get('source_references')),
                'validation_summary': ensure_array(extraction_data.get('validation_summary'))
            }

        except Exception as e:
            print(f"Error getting meeting extractions: {str(e)}")
            traceback.print_exc()
            return {}

