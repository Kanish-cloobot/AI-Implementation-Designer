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


class MeetingExtractionService:
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
            # Get all files for the meeting
            files_query = '''
                SELECT * FROM meeting_files
                WHERE meeting_id = ? AND org_id = ? AND status = 'uploaded'
            '''
            files = self.db_manager.fetch_all(
                files_query,
                (meeting_id, org_id)
            )

            if not files:
                return {'status': 'no_files', 'message': 'No files to process'}

            # Extract text from all files
            combined_text = ""
            for file in files:
                try:
                    file_text = self.doc_processor.extract_text(file['storage_path'])
                    combined_text += f"\n\n--- File: {file['file_name']} ---\n\n{file_text}"
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
- Each V1–V16 key must contain a list of JSON objects.
- All text content should be written as Markdown within string values.
- Use double-quoted keys, properly escaped strings, and no trailing commas.
- Each array must exist even if empty.

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
        """Store all extractions in database tables"""
        try:
            # Store metadata
            if 'document_metadata' in data:
                for item in data['document_metadata']:
                    self._insert_extraction(
                        'extraction_metadata',
                        meeting_id, workspace_id, org_id, item
                    )

            # Store V1: BU/Teams
            if 'V1_list_of_bu_teams' in data:
                for item in data['V1_list_of_bu_teams']:
                    self._insert_extraction(
                        'extraction_bu_teams',
                        meeting_id, workspace_id, org_id,
                        {
                            'business_unit': item.get('business_unit', ''),
                            'teams': json.dumps(item.get('teams', [])),
                            'notes_md': item.get('notes_md', '')
                        }
                    )

            # Store V2: Modules and Processes
            if 'V2_modules_and_processes' in data:
                for item in data['V2_modules_and_processes']:
                    self._insert_extraction(
                        'extraction_modules_processes',
                        meeting_id, workspace_id, org_id,
                        {
                            'module_name': item.get('module_name', ''),
                            'processes': json.dumps(item.get('processes', [])),
                            'scope_tag': item.get('scope_tag', ''),
                            'notes_md': item.get('notes_md', '')
                        }
                    )

            # Store V3: Licenses
            if 'V3_license_list' in data:
                for item in data['V3_license_list']:
                    self._insert_extraction(
                        'extraction_licenses',
                        meeting_id, workspace_id, org_id,
                        {
                            'license_type': item.get('license_type', ''),
                            'count': item.get('count', 0),
                            'allocation_md': item.get('allocation_md', ''),
                            'notes_md': item.get('notes_md', '')
                        }
                    )

            # Store V4: Personas
            if 'V4_personas' in data:
                for item in data['V4_personas']:
                    self._insert_extraction(
                        'extraction_personas',
                        meeting_id, workspace_id, org_id,
                        {
                            'persona_name': item.get('persona_name', ''),
                            'responsibilities': json.dumps(item.get('responsibilities', [])),
                            'primary_modules': json.dumps(item.get('primary_modules', []))
                        }
                    )

            # Store V5: Requirements
            if 'V5_requirements' in data:
                for item in data['V5_requirements']:
                    self._insert_extraction(
                        'extraction_requirements',
                        meeting_id, workspace_id, org_id,
                        {
                            'requirement_type': item.get('requirement_type', ''),
                            'description_md': item.get('description_md', ''),
                            'acceptance_criteria': json.dumps(item.get('acceptance_criteria', []))
                        }
                    )

            # Store V6: Risks and Issues
            if 'V6_risks_and_issues' in data:
                for item in data['V6_risks_and_issues']:
                    self._insert_extraction(
                        'extraction_risks_issues',
                        meeting_id, workspace_id, org_id,
                        {
                            'type': item.get('type', ''),
                            'description_md': item.get('description_md', ''),
                            'impact_md': item.get('impact_md', ''),
                            'mitigation_md': item.get('mitigation_md', ''),
                            'owner_md': item.get('owner_md', ''),
                            'due_date': item.get('due_date', '')
                        }
                    )

            # Store V7: Action Items
            if 'V7_action_items' in data:
                for item in data['V7_action_items']:
                    self._insert_extraction(
                        'extraction_action_items',
                        meeting_id, workspace_id, org_id,
                        {
                            'task_md': item.get('task_md', ''),
                            'owner_md': item.get('owner_md', ''),
                            'due_date': item.get('due_date', ''),
                            'item_status': item.get('status', 'open')
                        }
                    )

            # Store V8: Decisions
            if 'V8_decisions' in data:
                for item in data['V8_decisions']:
                    self._insert_extraction(
                        'extraction_decisions',
                        meeting_id, workspace_id, org_id,
                        {
                            'decision_md': item.get('decision_md', ''),
                            'rationale_md': item.get('rationale_md', ''),
                            'decided_on': item.get('decided_on', ''),
                            'approver_md': item.get('approver_md', '')
                        }
                    )

            # Store V9: Dependencies
            if 'V9_dependencies' in data:
                for item in data['V9_dependencies']:
                    self._insert_extraction(
                        'extraction_dependencies',
                        meeting_id, workspace_id, org_id,
                        {
                            'description_md': item.get('description_md', ''),
                            'type': item.get('type', ''),
                            'depends_on_md': item.get('depends_on_md', ''),
                            'owner_md': item.get('owner_md', '')
                        }
                    )

            # Store V10: Pain Points
            if 'V10_pain_points' in data:
                for item in data['V10_pain_points']:
                    self._insert_extraction(
                        'extraction_pain_points',
                        meeting_id, workspace_id, org_id,
                        {
                            'pain_point_md': item.get('pain_point_md', ''),
                            'affected_bu_md': item.get('affected_bu_md', ''),
                            'impact_md': item.get('impact_md', '')
                        }
                    )

            # Store V11: Current State
            if 'V11_current_state_as_is' in data:
                for item in data['V11_current_state_as_is']:
                    self._insert_extraction(
                        'extraction_current_state',
                        meeting_id, workspace_id, org_id,
                        {
                            'description_md': item.get('description_md', '')
                        }
                    )

            # Store V12: Target State
            if 'V12_target_state_to_be' in data:
                for item in data['V12_target_state_to_be']:
                    self._insert_extraction(
                        'extraction_target_state',
                        meeting_id, workspace_id, org_id,
                        {
                            'description_md': item.get('description_md', '')
                        }
                    )

            # Store V13: Integrations
            if 'V13_applications_to_be_integrated' in data:
                for item in data['V13_applications_to_be_integrated']:
                    self._insert_extraction(
                        'extraction_integrations',
                        meeting_id, workspace_id, org_id,
                        {
                            'application_name': item.get('application_name', ''),
                            'purpose_md': item.get('purpose_md', ''),
                            'integration_type': item.get('integration_type', ''),
                            'directionality': item.get('directionality', ''),
                            'notes_md': item.get('notes_md', '')
                        }
                    )

            # Store V14: Data Migration
            if 'V14_data_migration' in data:
                for item in data['V14_data_migration']:
                    self._insert_extraction(
                        'extraction_data_migration',
                        meeting_id, workspace_id, org_id,
                        {
                            'source_md': item.get('source_md', ''),
                            'mapping_notes_md': item.get('mapping_notes_md', ''),
                            'cleansing_rules_md': item.get('cleansing_rules_md', ''),
                            'tools_md': json.dumps(item.get('tools_md', []))
                        }
                    )

            # Store V15: Data Model
            if 'V15_data_model' in data:
                for item in data['V15_data_model']:
                    self._insert_extraction(
                        'extraction_data_model',
                        meeting_id, workspace_id, org_id,
                        {
                            'entity_name': item.get('entity_name', ''),
                            'entity_type': item.get('entity_type', ''),
                            'key_fields': json.dumps(item.get('key_fields', [])),
                            'relationships_md': item.get('relationships_md', '')
                        }
                    )

            # Store V16: Metadata Updates
            if 'V16_metadata_to_update' in data:
                for item in data['V16_metadata_to_update']:
                    self._insert_extraction(
                        'extraction_metadata_updates',
                        meeting_id, workspace_id, org_id,
                        {
                            'component_type': item.get('component_type', ''),
                            'api_name_md': item.get('api_name_md', ''),
                            'change_type': item.get('change_type', ''),
                            'scope_md': item.get('scope_md', '')
                        }
                    )

            # Store Scope Summary
            if 'scope_summary' in data:
                for item in data['scope_summary']:
                    self._insert_extraction(
                        'extraction_scope_summary',
                        meeting_id, workspace_id, org_id,
                        {
                            'in_scope_md': json.dumps(item.get('in_scope_md', [])),
                            'out_of_scope_md': json.dumps(item.get('out_of_scope_md', [])),
                            'future_phase_md': json.dumps(item.get('future_phase_md', []))
                        }
                    )

            # Store Assumptions and Gaps
            if 'assumptions_and_gaps' in data:
                for item in data['assumptions_and_gaps']:
                    self._insert_extraction(
                        'extraction_assumptions_gaps',
                        meeting_id, workspace_id, org_id,
                        {
                            'note_md': item.get('note_md', '')
                        }
                    )

            # Store Source References
            if 'source_references' in data:
                for item in data['source_references']:
                    self._insert_extraction(
                        'extraction_source_references',
                        meeting_id, workspace_id, org_id,
                        {
                            'reference_md': item.get('reference_md', '')
                        }
                    )

            # Store Validation Summary
            if 'validation_summary' in data:
                for item in data['validation_summary']:
                    self._insert_extraction(
                        'extraction_validation_summary',
                        meeting_id, workspace_id, org_id,
                        {
                            'json_validity': 1 if item.get('json_validity', False) else 0,
                            'issues_detected': json.dumps(item.get('issues_detected', []))
                        }
                    )

        except Exception as e:
            print(f"Error storing extractions: {str(e)}")
            traceback.print_exc()

    def _insert_extraction(self, table_name, meeting_id, workspace_id, org_id, data):
        """Generic insert for extraction tables"""
        try:
            columns = ['meeting_id', 'workspace_id', 'org_id']
            values = [meeting_id, workspace_id, org_id]

            for key, value in data.items():
                columns.append(key)
                values.append(value)

            columns.append('created_at')
            values.append(datetime.now())

            placeholders = ', '.join(['?' for _ in values])
            query = f'''
                INSERT INTO {table_name} ({', '.join(columns)})
                VALUES ({placeholders})
            '''

            self.db_manager.execute_query(query, tuple(values))

        except Exception as e:
            print(f"Error inserting into {table_name}: {str(e)}")
            traceback.print_exc()

    def _count_extractions(self, data):
        """Count number of items in each extraction category"""
        counts = {}
        for key in data.keys():
            if isinstance(data[key], list):
                counts[key] = len(data[key])
        return counts

    def get_meeting_extractions(self, meeting_id, org_id):
        """Retrieve all extractions for a meeting"""
        try:
            extractions = {}

            # Define all extraction tables and their keys
            extraction_tables = {
                'bu_teams': 'extraction_bu_teams',
                'modules_processes': 'extraction_modules_processes',
                'licenses': 'extraction_licenses',
                'personas': 'extraction_personas',
                'requirements': 'extraction_requirements',
                'risks_issues': 'extraction_risks_issues',
                'action_items': 'extraction_action_items',
                'decisions': 'extraction_decisions',
                'dependencies': 'extraction_dependencies',
                'pain_points': 'extraction_pain_points',
                'current_state': 'extraction_current_state',
                'target_state': 'extraction_target_state',
                'integrations': 'extraction_integrations',
                'data_migration': 'extraction_data_migration',
                'data_model': 'extraction_data_model',
                'metadata_updates': 'extraction_metadata_updates',
                'scope_summary': 'extraction_scope_summary',
                'assumptions_gaps': 'extraction_assumptions_gaps',
                'source_references': 'extraction_source_references',
                'validation_summary': 'extraction_validation_summary'
            }

            for key, table_name in extraction_tables.items():
                query = f'''
                    SELECT * FROM {table_name}
                    WHERE meeting_id = ? AND org_id = ? AND status = 'active'
                '''
                results = self.db_manager.fetch_all(query, (meeting_id, org_id))

                # Parse JSON fields
                for result in results:
                    for field_key in result.keys():
                        if field_key in ['teams', 'processes', 'primary_modules',
                                         'responsibilities', 'acceptance_criteria',
                                         'key_fields', 'tools_md', 'issues_detected',
                                         'in_scope_md', 'out_of_scope_md', 'future_phase_md']:
                            try:
                                result[field_key] = json.loads(result[field_key])
                            except (json.JSONDecodeError, TypeError):
                                result[field_key] = []

                extractions[key] = results

            return extractions

        except Exception as e:
            print(f"Error getting meeting extractions: {str(e)}")
            traceback.print_exc()
            return {}

