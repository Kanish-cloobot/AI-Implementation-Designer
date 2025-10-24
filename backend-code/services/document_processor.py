import os
import io
import PyPDF2
import docx


class DocumentProcessor:
    def extract_text(self, file_content, file_extension):
        """
        Extract text from file content stored in database
        Args:
            file_content: Binary file content from database
            file_extension: File extension (e.g., 'pdf', 'docx', 'txt')
        """
        if not file_content:
            raise ValueError("File content is empty")
        
        file_extension = file_extension.lower()
        
        if file_extension == 'pdf':
            return self._extract_from_pdf(file_content)
        elif file_extension in ['doc', 'docx']:
            return self._extract_from_docx(file_content)
        elif file_extension == 'txt':
            return self._extract_from_txt(file_content)
        else:
            raise ValueError(f"Unsupported file type: {file_extension}")

    def _extract_from_pdf(self, file_content):
        try:
            text = ""
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
            for page in pdf_reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
            return text.strip()
        except Exception as e:
            print(f"Error extracting from PDF: {str(e)}")
            raise

    def _extract_from_docx(self, file_content):
        try:
            doc = docx.Document(io.BytesIO(file_content))
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text.strip()
        except Exception as e:
            print(f"Error extracting from DOCX: {str(e)}")
            raise

    def _extract_from_txt(self, file_content):
        try:
            # Decode binary content to text
            text_content = file_content.decode('utf-8')
            return text_content.strip()
        except Exception as e:
            print(f"Error extracting from TXT: {str(e)}")
            raise

