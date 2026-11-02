import os
import re
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable, Image
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super().showPage()
        super().save()

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (on pages > 1)
        if self._pageNumber > 1:
            self.drawString(40, 760, "SPOT LIGHT BIRIYANI — COMPLETE OPERATIONS & USER MANUAL")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(40, 752, 572, 752)

        # Footer
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(572, 28, page_str)
        self.drawString(40, 28, "CONFIDENTIAL — FOR RESTAURANT OPERATORS & PLATFORM ADMINISTRATOR")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(40, 38, 572, 38)
        self.restoreState()

def build_pdf():
    docs_dir = os.path.dirname(os.path.abspath(__file__))
    md_path = os.path.join(docs_dir, "SPOTLIGHT_FULL_OPERATIONS_MANUAL.md")
    pdf_path = os.path.join(docs_dir, "SPOTLIGHT_FULL_OPERATIONS_MANUAL.pdf")
    screenshots_dir = os.path.join(docs_dir, "screenshots")

    with open(md_path, "r", encoding="utf-8") as f:
        md_text = f.read()

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=40,
        rightMargin=40,
        topMargin=50,
        bottomMargin=50,
    )

    base_styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=base_styles['Title'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=colors.HexColor("#EA580C"),
        alignment=0,
        spaceAfter=10
    )

    h1_style = ParagraphStyle(
        'H1',
        parent=base_styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#C2410C"),
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'H2',
        parent=base_styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#0F172A"),
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    h3_style = ParagraphStyle(
        'H3',
        parent=base_styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor("#334155"),
        spaceBefore=8,
        spaceAfter=3,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body',
        parent=base_styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#1E293B"),
        spaceAfter=4
    )

    bullet_style = ParagraphStyle(
        'Bullet',
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=3
    )

    caption_style = ParagraphStyle(
        'Caption',
        parent=body_style,
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#C2410C"),
        alignment=1, # Center
        spaceBefore=4,
        spaceAfter=10
    )

    code_style = ParagraphStyle(
        'Code',
        parent=base_styles['Code'],
        fontName='Courier',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#0F172A"),
        backColor=colors.HexColor("#F1F5F9"),
        borderPadding=6,
        spaceBefore=6,
        spaceAfter=6
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=body_style,
        fontSize=8,
        leading=11
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=body_style,
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=colors.white
    )

    def make_screenshot_block(img_filename, caption_text):
        full_path = os.path.join(screenshots_dir, img_filename)
        if not os.path.exists(full_path):
            return []
        try:
            # Printable width: 532 (612 - 40 - 40)
            img = Image(full_path, width=490, height=290)
            caption = Paragraph(f"<b>Visual UI Reference:</b> {caption_text}", caption_style)
            return [
                Spacer(1, 4),
                KeepTogether([
                    img,
                    caption
                ]),
                Spacer(1, 4)
            ]
        except Exception as e:
            print(f"Error loading image {img_filename}: {e}")
            return []

    # Map sections to screenshots
    SCREENSHOT_MAP = {
        "1. PUBLIC WEBSITE & LEAD GENERATION WORKFLOW": [
            ("01_homepage.png", "Screen 1: Public Homepage & Authentic Chennai Dum Biriyani Showcase"),
            ("02_branches_radar.png", "Screen 2: Live South Chennai Kitchen Radar Map & Batch Stock Tracking")
        ],
        "2. SECURITY, AUTHENTICATION & ROLE ACCESS CONTROL": [
            ("03_login_portal.png", "Screen 3: Role-Based Gatekeeper Terminal Sign-In (Owner, Cashier, Kitchen, Admin)")
        ],
        "3. HIGH-SPEED COUNTER POS BILLING TERMINAL": [
            ("04_billing_pos.png", "Screen 4: High-Speed Counter POS Terminal with Deg Stock Enforced Limit & Direct Qty Input")
        ],
        "4. EXECUTIVE DASHBOARD & REAL MARGIN TRACKING": [
            ("05_executive_dashboard.png", "Screen 5: Executive Operating Profit Dashboard, COGS, and Platform Commission Bleed")
        ],
        "5. RAW MATERIAL & KITCHEN INVENTORY LEDGER": [
            ("06_stock_ledger.png", "Screen 6: Kitchen Inventory Ledger, Reorder Warning Alerts & In/Out Stock Movements")
        ],
        "6. ADVANCED REPORTS, DAY-END CLOSING & FORECASTING": [
            ("07_reports_forecast.png", "Screen 7: Financial Day-End Reports, Channel P&L Matrix & AI Prep Forecasting")
        ],
        "7. BRANCH CONFIGURATION, PRINTER SETTINGS & HARDWARE SETUP": [
            ("08_branch_settings.png", "Screen 8: Branch Kitchen Hubs, ESC/POS 80mm Thermal Printer & GST Setup")
        ],
    }

    story = []

    lines = md_text.split("\n")
    i = 0
    in_code_block = False
    code_lines = []

    while i < len(lines):
        line = lines[i]

        # Handle Code blocks
        if line.strip().startswith("```"):
            if in_code_block:
                in_code_block = False
                code_text = "<br/>".join(code_lines).replace(" ", "&nbsp;")
                story.append(Paragraph(code_text, code_style))
                story.append(Spacer(1, 4))
                code_lines = []
            else:
                in_code_block = True
                code_lines = []
            i += 1
            continue

        if in_code_block:
            safe_l = line.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            code_lines.append(safe_l)
            i += 1
            continue

        stripped = line.strip()

        # Handle empty lines
        if not stripped:
            i += 1
            continue

        # Handle Table
        if stripped.startswith("|") and stripped.endswith("|"):
            table_raw = []
            while i < len(lines) and lines[i].strip().startswith("|") and lines[i].strip().endswith("|"):
                row_str = lines[i].strip()
                if not re.match(r"^\|(\s*:?-+:?\s*\|)+$", row_str):
                    cols = [c.strip() for c in row_str.strip("|").split("|")]
                    table_raw.append(cols)
                i += 1

            if table_raw:
                table_data = []
                for row_idx, r in enumerate(table_raw):
                    row_cells = []
                    for c in r:
                        formatted_c = re.sub(r"\*\*(.*?)\*\*", r"<b>\1</b>", c)
                        formatted_c = re.sub(r"`(.*?)`", r"<font name='Courier'>\1</font>", formatted_c)
                        formatted_c = formatted_c.replace("<br>", "<br/>")
                        st = table_header_style if row_idx == 0 else table_cell_style
                        row_cells.append(Paragraph(formatted_c, st))
                    table_data.append(row_cells)

                t = Table(table_data, colWidths=[110, 140, 282])
                t.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#C2410C")),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('TOPPADDING', (0, 0), (-1, -1), 4),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                    ('LEFTPADDING', (0, 0), (-1, -1), 6),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor("#FFFFFF"), colors.HexColor("#F8FAFC")]),
                ]))
                story.append(Spacer(1, 6))
                story.append(t)
                story.append(Spacer(1, 6))
            continue

        # Handle Horizontal Rule
        if stripped == "---":
            story.append(Spacer(1, 4))
            story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor("#E2E8F0"), spaceAfter=8, spaceBefore=4))
            i += 1
            continue

        # Handle Headings
        if stripped.startswith("# "):
            h_text = stripped[2:].replace("**", "").strip()
            story.append(Paragraph(h_text, title_style))
            i += 1
            continue
        elif stripped.startswith("## "):
            h_text = stripped[3:].replace("**", "").strip()
            story.append(Paragraph(h_text, h1_style))
            
            # Check if this heading has matching screenshots to attach
            for key, shots in SCREENSHOT_MAP.items():
                if key in h_text:
                    for shot_file, shot_caption in shots:
                        story.extend(make_screenshot_block(shot_file, shot_caption))

            i += 1
            continue
        elif stripped.startswith("### "):
            h_text = stripped[4:].replace("**", "").strip()
            story.append(Paragraph(h_text, h2_style))
            i += 1
            continue
        elif stripped.startswith("#### "):
            h_text = stripped[5:].replace("**", "").strip()
            story.append(Paragraph(h_text, h3_style))
            i += 1
            continue

        # Handle bullets
        is_bullet = False
        text_content = stripped
        if stripped.startswith("- ") or stripped.startswith("* "):
            is_bullet = True
            text_content = "&bull; " + stripped[2:].strip()
        elif re.match(r"^\d+\.\s+", stripped):
            is_bullet = True
            m = re.match(r"^(\d+\.)\s+(.*)", stripped)
            text_content = f"<b>{m.group(1)}</b> {m.group(2)}"

        # Clean markdown bold/code
        text_content = re.sub(r"\*\*(.*?)\*\*", r"<b>\1</b>", text_content)
        text_content = re.sub(r"`(.*?)`", r"<font name='Courier'>\1</font>", text_content)

        style = bullet_style if is_bullet else body_style
        story.append(Paragraph(text_content, style))
        i += 1

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Master Operations Manual PDF with Embedded Screenshots built successfully: {pdf_path}")

if __name__ == "__main__":
    build_pdf()
