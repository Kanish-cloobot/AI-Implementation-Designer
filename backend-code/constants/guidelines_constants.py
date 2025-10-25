METADATA_PROMPT_EXTRACTOR = """Objective
You are an expert analyst for Salesforce implementation discovery, design, and build.
Given an input (meeting transcript, SoW, contract, notes), extract exactly the 16 value groups (V1–V16) listed below.
Your output must be one valid JSON object only, wrapped in Markdown code fences.
Each value must be a list of JSON objects, and all related attributes must be encapsulated within those objects.

Denoising & Relevance Rules
- Only extract content relevant to Salesforce discovery/design/build (scope, modules, roles, licenses, integrations, data, metadata, risks/issues, decisions, etc.).
- Ignore unrelated details such as greetings, small talk, boilerplate, pricing, or legal terms.
- If multiple domains are present, focus on Salesforce CRM context and ignore unrelated project areas.
- If a value is missing, leave the array empty and describe the gap in assumptions_and_gaps.

Source Reference Requirements
- For each extracted item, provide source references indicating where the information came from.
- Include the file name, relevant quote, and confidence level for each source.
- Source references should be specific and traceable back to the original content.
- If information comes from multiple sources, include all relevant sources.

Output Requirements
- Output must be a single JSON object, enclosed in triple backticks (```json ... ```).
- Each V1-V16 key must contain a list of JSON objects.
- All text content should be written as Markdown within string values.
- Use double-quoted keys, properly escaped strings, and no trailing commas.
- Each array must exist even if empty.
- Each object must include source_references array with file names and quotes.

JSON Structure Required:
{{
  "document_metadata": [{{
    "source_type": "transcript | SoW | contract",
    "doc_title": "document title if known",
    "extraction_timestamp": "YYYY-MM-DD",
    "confidence": 0.0,
  }}],
  "V1_list_of_bu_teams": [{{
    "business_unit": "business unit name",
    "teams": ["team name 1", "team name 2"],
    "notes_md": "additional notes",
    "source_references": [{{
      "file_name": "source file name",
      "quote_text": "exact relevant excerpt quote from source",
      "confidence": 0.0,
      "page_section": "section or context within file"
    }}]
  }}],
  "V2_modules_and_processes": [{{
    "module_name": "module name",
    "processes": ["process 1", "process 2"],
    "scope_tag": "in-scope | out-of-scope | future-phase",
    "notes_md": "short description",
    "source_references": [{{
      "file_name": "source file name",
      "quote_text": "exact relevant excerpt quote from source",
      "confidence": 0.0,
      "page_section": "section or context within file"
    }}]
  }}],
  "V3_license_list": [{{
    "license_type": "Sales Cloud, Service Cloud, Platform, etc.",
    "count": 0,
    "allocation_md": "allocation details",
    "notes_md": "notes",
    "source_references": [{{
      "file_name": "source file name",
      "quote_text": "exact relevant excerpt quote from source",
      "confidence": 0.0,
      "page_section": "section or context within file"
    }}]
  }}],
  "V4_personas": [{{
    "persona_name": "e.g., Sales Manager",
    "responsibilities": ["task 1", "task 2"],
    "primary_modules": ["module 1", "module 2"],
    "source_references": [{{
      "file_name": "source file name",
      "quote_text": "exact relevant excerpt quote from source",
      "confidence": 0.0,
      "page_section": "section or context within file"
    }}]
  }}],
  "V5_requirements": [{{
    "requirement_type": "functional | non-functional",
    "description_md": "short description",
    "acceptance_criteria": ["criterion 1", "criterion 2"],
    "source_references": [{{
      "file_name": "source file name",
      "quote_text": "exact relevant excerpt quote from source",
      "confidence": 0.0,
      "page_section": "section or context within file"
    }}]
  }}],
  "V6_risks_and_issues": [{{
    "type": "risk | issue",
    "description_md": "description",
    "impact_md": "impact details",
    "mitigation_md": "mitigation plan",
    "owner_md": "owner or team",
    "due_date": "YYYY-MM-DD or empty string",
    "source_references": [{{
      "file_name": "source file name",
      "quote_text": "exact relevant excerpt quote from source",
      "confidence": 0.0,
      "page_section": "section or context within file"
    }}]
  }}],
  "V7_action_items": [{{
    "task_md": "action task",
    "owner_md": "responsible person",
    "due_date": "YYYY-MM-DD or empty string",
    "status": "open | in-progress | done",
    "source_references": [{{
      "file_name": "source file name",
      "quote_text": "exact relevant excerpt quote from source",
      "confidence": 0.0,
      "page_section": "section or context within file"
    }}]
  }}],
  "V8_decisions": [{{
    "decision_md": "what was decided",
    "rationale_md": "reasoning",
    "decided_on": "YYYY-MM-DD or empty string",
    "approver_md": "approver",
    "source_references": [{{
      "file_name": "source file name",
      "quote_text": "exact relevant excerpt quote from source",
      "confidence": 0.0,
      "page_section": "section or context within file"
    }}]
  }}],
  "V9_dependencies": [{{
    "description_md": "dependency details",
    "type": "internal | external",
    "depends_on_md": "related system/team",
    "owner_md": "responsible entity",
    "source_references": [{{
      "file_name": "source file name",
      "quote_text": "exact relevant excerpt quote from source",
      "confidence": 0.0,
      "page_section": "section or context within file"
    }}]
  }}],
  "V10_pain_points": [{{
    "pain_point_md": "problem statement",
    "affected_bu_md": "affected business unit",
    "impact_md": "business or process impact",
    "source_references": [{{
      "file_name": "source file name",
      "quote_text": "exact relevant excerpt quote from source",
      "confidence": 0.0,
      "page_section": "section or context within file"
    }}]
  }}],
  "V11_current_state_as_is": [{{
    "description_md": "paragraph(s) describing current processes and tools",
    "source_references": [{{
      "file_name": "source file name",
      "quote_text": "exact relevant excerpt quote from source",
      "confidence": 0.0,
      "page_section": "section or context within file"
    }}]
  }}],
  "V12_target_state_to_be": [{{
    "description_md": "paragraph(s) describing desired Salesforce-enabled future state",
    "source_references": [{{
      "file_name": "source file name",
      "quote_text": "exact relevant excerpt quote from source",
      "confidence": 0.0,
      "page_section": "section or context within file"
    }}]
  }}],
  "V13_applications_to_be_integrated": [{{
    "application_name": "app name (QuickBooks, DocuSign, etc.)",
    "purpose_md": "purpose of integration",
    "integration_type": "native | OOTB | third-party | custom",
    "directionality": "unidirectional | bidirectional",
    "notes_md": "notes",
    "source_references": [{{
      "file_name": "source file name",
      "quote_text": "exact relevant excerpt quote from source",
      "confidence": 0.0,
      "page_section": "section or context within file"
    }}]
  }}],
  "V14_data_migration": [{{
    "source_md": "data sources (Excel, legacy CRM)",
    "mapping_notes_md": "key field mapping details",
    "cleansing_rules_md": "cleansing rules",
    "tools_md": ["tool name"],
    "source_references": [{{
      "file_name": "source file name",
      "quote_text": "exact relevant excerpt quote from source",
      "confidence": 0.0,
      "page_section": "section or context within file"
    }}]
  }}],
  "V15_data_model": [{{
    "entity_name": "object/entity name",
    "entity_type": "standard | custom",
    "key_fields": ["key field 1", "key field 2"],
    "relationships_md": "relationships between entities",
    "source_references": [{{
      "file_name": "source file name",
      "quote_text": "exact relevant excerpt quote from source",
      "confidence": 0.0,
      "page_section": "section or context within file"
    }}]
  }}],
  "V16_metadata_to_update": [{{
    "component_type": "Object | Field | Flow | Apex | Layout | Profile | Report | Dashboard | LWC | Other",
    "api_name_md": "API name or short identifier",
    "change_type": "create | update | deprecate",
    "scope_md": "reason or context for change",
    "source_references": [{{
      "file_name": "source file name",
      "quote_text": "exact relevant excerpt quote from source",
      "confidence": 0.0,
      "page_section": "section or context within file"
    }}]
  }}],
  "scope_summary": [{{
    "in_scope_md": ["in-scope item"],
    "out_of_scope_md": ["out-of-scope item"],
    "future_phase_md": ["deferred or future-phase item"],
    "source_references": [{{
      "file_name": "source file name",
      "quote_text": "exact relevant excerpt quote from source",
      "confidence": 0.0,
      "page_section": "section or context within file"
    }}]
  }}],
  "assumptions_and_gaps": [{{
    "note_md": "any inferred assumption or missing information description",
    "source_references": [{{
      "file_name": "source file name",
      "quote_text": "exact relevant excerpt quote from source",
      "confidence": 0.0,
      "page_section": "section or context within file"
    }}]
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
- Each key (V1-V16) is an array of objects, even if empty.
- All strings are properly escaped, all keys double-quoted.
- No trailing commas or null values.
- Markdown formatting lives inside string values.
- Dates follow YYYY-MM-DD.
- Denoising applied - only Salesforce-relevant content extracted.
- Each object includes source_references array with file names and quotes.
- Source references must be specific and traceable to original content.

Assumptions Policy
- Infer carefully; log all assumptions under assumptions_and_gaps.
- Never fabricate personal data; use generic role placeholders.
- Leave arrays empty for missing data and record the gap.

Final Instruction
Perform extraction now and return only the JSON object above, enclosed within json code fences.
"""