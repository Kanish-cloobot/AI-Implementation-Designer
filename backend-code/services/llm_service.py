import os
import json
from openai import OpenAI


class LLMService:
    def __init__(self):
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise ValueError('OPENAI_API_KEY not found in environment variables')
        self.client = OpenAI(api_key=api_key)
        self.model = "gpt-4"

    def extract_sow_insights(self, document_text):
        prompt = self._build_sow_extraction_prompt()
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": document_text}
                ],
                temperature=0.3,
                max_tokens=4000
            )
            
            content = response.choices[0].message.content
            
            json_str = self._extract_json_from_response(content)
            
            parsed_data = json.loads(json_str)
            
            return json.dumps(parsed_data, indent=2)
        
        except Exception as e:
            print(f"Error in LLM extraction: {str(e)}")
            return json.dumps(self._get_default_response(str(e)))

    def _build_sow_extraction_prompt(self):
        return """## **Prompt Instruction: Salesforce Implementation Scope Extractor**

### **Objective**

You are an AI assistant specialized in **Salesforce Implementation Consulting**.
Your goal is to **analyze uploaded documents** such as the *Sales Hand-off Package* or *Statement of Work (SoW)* and extract all information needed to define **Project Scope, Modules, Processes, Stakeholders, and License Inventory**.

The final output **must be a single valid JSON block**, wrapped in **Markdown format**, with all content written inside each key's value (not as external commentary).

---

### **Input**

* User will upload one or more documents (SoW, Sales hand-off package, BRD, etc.)
* Each may contain business unit details, module descriptions, in-scope and out-of-scope items, stakeholders, and Salesforce licensing information.

---

### **Task Instructions**

1. **Read and interpret** all uploaded content carefully.
2. **Extract**:

   * **Scope Summary**

     * `in_scope`: Items, functionalities, modules, integrations, or processes explicitly in scope.
     * `out_of_scope`: Anything marked as excluded, deferred, or future phase.
   * **Modules and Processes**

     * Identify each major *business module* (e.g., Lead Management, Order Processing, Case Management).
     * For each module, extract its *key processes* or *sub-functions*.
   * **Business Units & Stakeholders**

     * Identify all *business units/departments* mentioned.
     * Under each BU, list:

       * Stakeholder Name
       * Designation/Role
       * Email (if available)
   * **Salesforce Licenses**

     * Identify all Salesforce license types (Sales Cloud, Service Cloud, FSL, Platform, etc.)
     * Include quantity or allocation if mentioned.

---

### **Output Format**

Produce the output **as a single JSON object inside Markdown code fences**:

```json
{
  "scope_summary": {
    "in_scope": [
      "List each in-scope item here in Markdown bullet format"
    ],
    "out_of_scope": [
      "List each out-of-scope item here in Markdown bullet format"
    ]
  },
  "modules": [
    {
      "module_name": "Module 1 Name",
      "description": "Short description of what this module covers",
      "processes": [
        "- Process 1: short description",
        "- Process 2: short description"
      ]
    }
  ],
  "business_units": [
    {
      "business_unit_name": "BU Name",
      "stakeholders": [
        {
          "name": "Full Name",
          "designation": "Designation / Role",
          "email": "email@example.com"
        }
      ]
    }
  ],
  "salesforce_licenses": [
    {
      "license_type": "Sales Cloud / Service Cloud / Platform / FSL / etc.",
      "count": "Number if available, else 'unknown'"
    }
  ],
  "assumptions": [
    "State all assumptions made to fill gaps in missing data"
  ],
  "validation_summary": {
    "json_validity": "true/false",
    "issues_detected": [
      "List any issues or inconsistencies found in the extracted data"
    ]
  }
}
```

---

### **Validation Rules**

1. Output must be **strictly valid JSON**:

   * All keys must be **double-quoted**.
   * Arrays and objects must be **properly closed**.
   * No trailing commas.
   * No comments outside JSON (everything must be within Markdown code fences).
2. All string values must be properly escaped (`\\"`, `\\\\n`).
3. If any field cannot be found, include a **placeholder** with `"unknown"` or `"not specified"`.
4. If you infer something, list the **assumption** explicitly in the `"assumptions"` array.

---

### **Assumption Rules**

* If business units are not explicitly named, infer them from context (e.g., "Sales," "Service," "Finance," etc.).
* If stakeholder details are incomplete, infer plausible placeholders:

  * `"name": "Not Provided"`
  * `"designation": "Inferred based on context"`
  * `"email": "unknown@example.com"`
* If Salesforce license type is unclear, infer `"Platform"` as a default placeholder but note it under `"assumptions"`.
* Maintain logical consistency (e.g., do not assign Service Cloud features to a client with only Sales Cloud licenses).

---

### **Tone and Format Requirements**

* Use **Markdown** formatting for the entire JSON output block.
* Do **not** include any prose, commentary, or explanation outside the JSON block.
* Ensure the structure is **complete, human-readable, and machine-parsable**.

---

**IMPORTANT**: Only return the JSON object. Do not include any additional text, explanation, or markdown formatting outside the JSON code fence."""

    def _extract_json_from_response(self, content):
        if '```json' in content:
            start = content.find('```json') + 7
            end = content.find('```', start)
            if end != -1:
                return content[start:end].strip()
        elif '```' in content:
            start = content.find('```') + 3
            end = content.find('```', start)
            if end != -1:
                return content[start:end].strip()
        
        return content.strip()

    def _get_default_response(self, error_msg):
        return {
            "scope_summary": {
                "in_scope": ["Unable to extract scope information"],
                "out_of_scope": []
            },
            "modules": [],
            "business_units": [],
            "salesforce_licenses": [],
            "assumptions": [
                f"Error occurred during extraction: {error_msg}"
            ],
            "validation_summary": {
                "json_validity": False,
                "issues_detected": [
                    "Failed to extract data from document"
                ]
            }
        }

