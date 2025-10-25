import openai
import json
import time
import traceback
from config import OPENAI_CONFIG
from constants.guidelines_constants import SOW_EXTRACTION_PROMPT

# Configure OpenAI for Azure
openai.api_type = "azure"
openai.api_base = OPENAI_CONFIG['azure_endpoint']
openai.api_version = OPENAI_CONFIG['api_version']
openai.api_key = OPENAI_CONFIG['api_key']


class LLMService:
    def __init__(self):
        if not OPENAI_CONFIG['api_key']:
            raise ValueError('AZURE_OPENAI_API_KEY not found in configuration')
        self.deployment = OPENAI_CONFIG['deployment']
        self.max_tokens = OPENAI_CONFIG['max_tokens']
        self.temperature = OPENAI_CONFIG['temperature']
        self.top_p = OPENAI_CONFIG['top_p']

    def extract_sow_insights(self, document_text):
        """
        Extract SoW insights from document using Azure OpenAI.
        
        Args:
            document_text (str): Extracted text from document
            
        Returns:
            tuple: (json_string, messages_array) - JSON string with extracted data and messages array for logging
        """
        
        try:
            start_time = time.time()
            
            # Prepare messages for API call
            messages = [
                {"role": "system", "content": SOW_EXTRACTION_PROMPT},
                {"role": "user", "content": document_text}
            ]
            
            # Create request content for logging
            request_data = {
                "messages": messages,
                "deployment": self.deployment,
                "max_tokens": self.max_tokens,
                "temperature": self.temperature,
                "top_p": self.top_p
            }
            
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
            content = response.choices[0].message.content
            
            # Get token usage
            tokens_used = response.get('usage', {}).get('total_tokens', 0)
            
            print(f"Azure OpenAI call successful - Tokens: {tokens_used}, Latency: {latency_ms}ms")
            
            # Extract and parse JSON from response
            json_str = self._extract_json_from_response(content)
            parsed_data = json.loads(json_str)
            
            return json.dumps(parsed_data, indent=2), messages
        
        except openai.error.InvalidRequestError as e:
            print(f"Invalid request to Azure OpenAI: {str(e)}")
            traceback.print_exc()
            return json.dumps(self._get_default_response(
                f"Invalid request: {str(e)}"
            )), messages
        
        except openai.error.AuthenticationError as e:
            print(f"Authentication error with Azure OpenAI: {str(e)}")
            traceback.print_exc()
            return json.dumps(self._get_default_response(
                f"Authentication error: {str(e)}"
            )), messages
        
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON from LLM response: {str(e)}")
            traceback.print_exc()
            return json.dumps(self._get_default_response(
                f"JSON parsing error: {str(e)}"
            )), messages
        
        except Exception as e:
            print(f"Error in LLM extraction: {str(e)}")
            traceback.print_exc()
            return json.dumps(self._get_default_response(str(e))), messages

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

