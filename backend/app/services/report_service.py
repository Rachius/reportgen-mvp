from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.units import cm
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
import io

TEAL = HexColor('#1D9E75')
DARK = HexColor('#1a1a2e')
GRAY = HexColor('#6b7280')

def generate_pdf(analysis: dict) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4,
                            leftMargin=2*cm, rightMargin=2*cm,
                            topMargin=2*cm, bottomMargin=2*cm)
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle('Title', fontSize=22, textColor=DARK,
                                  spaceAfter=6, fontName='Helvetica-Bold')
    h2_style = ParagraphStyle('H2', fontSize=13, textColor=TEAL,
                               spaceAfter=4, spaceBefore=14, fontName='Helvetica-Bold')
    body_style = ParagraphStyle('Body', fontSize=10, textColor=DARK,
                                 spaceAfter=6, leading=16)
    small_style = ParagraphStyle('Small', fontSize=9, textColor=GRAY, spaceAfter=4)

    story = []

    story.append(Paragraph(analysis['titulo'], title_style))
    story.append(Spacer(1, 0.3*cm))
    story.append(Paragraph(analysis['resumen_ejecutivo'], body_style))

    story.append(Paragraph('KPIs principales', h2_style))
    kpi_data = [['Indicador', 'Valor', 'Descripción']]
    for k in analysis['kpis']:
        kpi_data.append([k['nombre'], k['valor'], k['descripcion']])
    kpi_table = Table(kpi_data, colWidths=[4.5*cm, 3*cm, 9*cm])
    kpi_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), TEAL),
        ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#ffffff')),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [HexColor('#f9fafb'), HexColor('#ffffff')]),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#e5e7eb')),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(kpi_table)

    story.append(Paragraph('Tendencias identificadas', h2_style))
    for t in analysis['tendencias']:
        story.append(Paragraph(f"<b>{t['titulo']}</b>", body_style))
        story.append(Paragraph(t['descripcion'], small_style))

    story.append(Paragraph('Top items', h2_style))
    top_data = [['Categoría', 'Valor', 'Participación']]
    for item in analysis['top_items']:
        top_data.append([item['categoria'], item['valor'], item['participacion']])
    top_table = Table(top_data, colWidths=[7*cm, 4*cm, 5.5*cm])
    top_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), TEAL),
        ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#ffffff')),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [HexColor('#f9fafb'), HexColor('#ffffff')]),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#e5e7eb')),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(top_table)

    story.append(Paragraph('Recomendaciones', h2_style))
    for r in analysis['recomendaciones']:
        story.append(Paragraph(f"<b>{r['titulo']}</b>", body_style))
        story.append(Paragraph(r['descripcion'], small_style))

    story.append(Paragraph('Conclusión', h2_style))
    story.append(Paragraph(analysis['conclusion'], body_style))

    doc.build(story)
    return buffer.getvalue()


def generate_pptx(analysis: dict) -> bytes:
    prs = Presentation()
    prs.slide_width = Inches(13.33)
    prs.slide_height = Inches(7.5)

    TEAL_RGB = RGBColor(0x1D, 0x9E, 0x75)
    DARK_RGB = RGBColor(0x1a, 0x1a, 0x2e)
    WHITE_RGB = RGBColor(0xFF, 0xFF, 0xFF)
    GRAY_RGB = RGBColor(0x6b, 0x72, 0x80)

    def add_slide(layout_idx=6):
        layout = prs.slide_layouts[layout_idx]
        return prs.slides.add_slide(layout)

    def add_textbox(slide, text, left, top, width, height,
                    size=18, bold=False, color=DARK_RGB, wrap=True):
        txBox = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(height))
        tf = txBox.text_frame
        tf.word_wrap = wrap
        p = tf.paragraphs[0]
        p.text = text
        p.runs[0].font.size = Pt(size)
        p.runs[0].font.bold = bold
        p.runs[0].font.color.rgb = color
        return txBox

    slide1 = add_slide()
    bg = slide1.shapes.add_shape(1, Inches(0), Inches(0), Inches(13.33), Inches(7.5))
    bg.fill.solid()
    bg.fill.fore_color.rgb = RGBColor(0xF9, 0xFA, 0xFB)
    bg.line.fill.background()
    accent = slide1.shapes.add_shape(1, Inches(0), Inches(0), Inches(0.15), Inches(7.5))
    accent.fill.solid()
    accent.fill.fore_color.rgb = TEAL_RGB
    accent.line.fill.background()
    add_textbox(slide1, analysis['titulo'], 0.5, 2.5, 12, 1.2, size=32, bold=True, color=DARK_RGB)
    add_textbox(slide1, 'Reporte generado por ReportGen', 0.5, 3.9, 8, 0.5, size=14, color=GRAY_RGB)

    slide2 = add_slide()
    add_textbox(slide2, 'Resumen ejecutivo', 0.4, 0.3, 12, 0.6, size=20, bold=True, color=TEAL_RGB)
    add_textbox(slide2, analysis['resumen_ejecutivo'], 0.4, 1.1, 12.5, 5, size=16, color=DARK_RGB)

    slide3 = add_slide()
    add_textbox(slide3, 'KPIs principales', 0.4, 0.3, 12, 0.6, size=20, bold=True, color=TEAL_RGB)
    cols = min(len(analysis['kpis']), 4)
    col_w = 12.5 / cols
    for i, kpi in enumerate(analysis['kpis'][:4]):
        x = 0.4 + i * col_w
        box = slide3.shapes.add_shape(1, Inches(x), Inches(1.2), Inches(col_w - 0.2), Inches(2.5))
        box.fill.solid()
        box.fill.fore_color.rgb = RGBColor(0xE1, 0xF5, 0xEE)
        box.line.color.rgb = TEAL_RGB
        add_textbox(slide3, kpi['valor'], x + 0.1, 1.5, col_w - 0.3, 0.9, size=22, bold=True, color=TEAL_RGB)
        add_textbox(slide3, kpi['nombre'], x + 0.1, 2.4, col_w - 0.3, 0.5, size=11, bold=True, color=DARK_RGB)
        add_textbox(slide3, kpi['descripcion'], x + 0.1, 2.9, col_w - 0.3, 0.7, size=9, color=GRAY_RGB)

    slide4 = add_slide()
    add_textbox(slide4, 'Recomendaciones', 0.4, 0.3, 12, 0.6, size=20, bold=True, color=TEAL_RGB)
    for i, rec in enumerate(analysis['recomendaciones'][:4]):
        y = 1.2 + i * 1.4
        dot = slide4.shapes.add_shape(9, Inches(0.4), Inches(y + 0.15), Inches(0.2), Inches(0.2))
        dot.fill.solid()
        dot.fill.fore_color.rgb = TEAL_RGB
        dot.line.fill.background()
        add_textbox(slide4, rec['titulo'], 0.75, y, 12, 0.4, size=13, bold=True, color=DARK_RGB)
        add_textbox(slide4, rec['descripcion'], 0.75, y + 0.4, 12, 0.8, size=11, color=GRAY_RGB)

    buffer = io.BytesIO()
    prs.save(buffer)
    return buffer.getvalue()