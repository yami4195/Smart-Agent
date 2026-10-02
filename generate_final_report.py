import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT, WD_TAB_LEADER
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn
import zipfile
import tempfile
import shutil
import os

def create_styled_document():
    # Load original document to preserve relationships and embedded images
    doc = docx.Document('Wegagen Bank Sc(software development)_original_backup.docx')
    
    # Configure document styles
    styles = doc.styles
    
    # Title
    t_style = styles['Title']
    t_style.font.name = 'Arial'
    t_style.font.size = Pt(16)
    t_style.font.bold = True
    t_style.font.color.rgb = RGBColor(0x00, 0x20, 0x60) # Deep Navy
    
    # Heading 1
    h1 = styles['Heading 1']
    h1.font.name = 'Arial'
    h1.font.size = Pt(16)
    h1.font.bold = True
    h1.font.color.rgb = RGBColor(0x00, 0x20, 0x60)
    h1.paragraph_format.space_before = Pt(12)
    h1.paragraph_format.space_after = Pt(6)
    
    # Heading 2
    h2 = styles['Heading 2']
    h2.font.name = 'Arial'
    h2.font.size = Pt(13)
    h2.font.bold = True
    h2.font.color.rgb = RGBColor(0x1F, 0x4E, 0x78)
    h2.paragraph_format.space_before = Pt(10)
    h2.paragraph_format.space_after = Pt(4)
    
    # Heading 3
    h3 = styles['Heading 3']
    h3.font.name = 'Arial'
    h3.font.size = Pt(11)
    h3.font.bold = True
    h3.font.color.rgb = RGBColor(0x2E, 0x75, 0xB5)
    h3.paragraph_format.space_before = Pt(6)
    h3.paragraph_format.space_after = Pt(2)
    
    # Normal
    norm = styles['Normal']
    norm.font.name = 'Times New Roman'
    norm.font.size = Pt(12)
    norm.font.color.rgb = RGBColor(0x00, 0x00, 0x00)
    norm.paragraph_format.line_spacing = 1.15
    norm.paragraph_format.space_after = Pt(4)
    norm.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    print("Base document styles initialized.")
    return doc

print("Setup completed.")
