import os
import PyPDF2
import docx


class DocumentProcessor:
    def extract_text(self, file_path):
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        
        file_extension = file_path.rsplit('.', 1)[1].lower()
        
        if file_extension == 'pdf':
            return self._extract_from_pdf(file_path)
        elif file_extension in ['doc', 'docx']:
            return self._extract_from_docx(file_path)
        elif file_extension == 'txt':
            return self._extract_from_txt(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_extension}")

    def _extract_from_pdf(self, file_path):
        try:
            text = ""
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    extracted = page.extract_text()
                    if extracted:
                        text += extracted + "\n"
            return text.strip()
        except Exception as e:
            print(f"Error extracting from PDF: {str(e)}")
            raise

    def _extract_from_docx(self, file_path):
        try:
            doc = docx.Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text.strip()
        except Exception as e:
            print(f"Error extracting from DOCX: {str(e)}")
            raise

    def _extract_from_txt(self, file_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read().strip()
        except Exception as e:
            print(f"Error extracting from TXT: {str(e)}")
            raise

