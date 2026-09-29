import { jsPDF } from 'jspdf';

/**
 * Strips basic markdown markers for clean text layout in jsPDF
 */
function cleanMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/^###\s+/gm, '')
    .replace(/^####\s+/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1');
}

/**
 * Formats date into readable string
 */
function formatDate(date) {
  try {
    const d = date ? new Date(date) : new Date();
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Recent';
  }
}

/**
 * Generates an academic study note PDF from chat conversation content
 */
export function generateNotesPDF({
  title = 'AI Doubt Solving Notes',
  subjectCode = 'GEN',
  subjectName = 'General Academic',
  studentName = 'Student',
  messages = [],
  summary = '',
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 16;
  const contentWidth = pageWidth - (marginX * 2);
  let y = 18;

  const checkPageBreak = (neededHeight) => {
    if (y + neededHeight > pageHeight - 20) {
      doc.addPage();
      y = 20;
      // Running header on sub-pages
      doc.setFillColor(248, 250, 252);
      doc.rect(marginX, 8, contentWidth, 7, 'F');
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`${title} • ${subjectCode}`, marginX + 2, 13);
      doc.setFont('helvetica', 'normal');
      return true;
    }
    return false;
  };

  // --- 1. Top Decorative Brand Bar ---
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.rect(marginX, y, contentWidth, 3, 'F');
  y += 8;

  // --- 2. Organization / Platform Header ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(99, 102, 241); // Indigo 500
  doc.text('AI DOUBT SOLVING PLATFORM  •  STUDENT PERSONAL REVISION NOTES', marginX, y);
  y += 7;

  // --- 3. Note Title ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // Slate 900
  const titleLines = doc.splitTextToSize(title, contentWidth);
  doc.text(titleLines, marginX, y);
  y += (titleLines.length * 7) + 2;

  // --- 4. Metadata Badge Card ---
  const cardHeight = 16;
  doc.setFillColor(241, 245, 249); // Slate 100
  doc.roundedRect(marginX, y, contentWidth, cardHeight, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(marginX, y, contentWidth, cardHeight, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text(`Subject: ${subjectCode} — ${subjectName}`, marginX + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Student: ${studentName}`, marginX + 4, y + 11.5);
  doc.text(`Generated: ${formatDate()}`, marginX + (contentWidth / 2) + 10, y + 11.5);

  y += cardHeight + 8;

  // --- 5. Executive Summary (if provided) ---
  if (summary) {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(67, 56, 202); // Indigo 700
    doc.text('EXECUTIVE REVISION SUMMARY', marginX, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    const summaryLines = doc.splitTextToSize(summary, contentWidth - 8);
    const sumBoxHeight = (summaryLines.length * 4.5) + 6;
    
    doc.setFillColor(245, 247, 255);
    doc.setDrawColor(199, 210, 254);
    doc.roundedRect(marginX, y, contentWidth, sumBoxHeight, 2, 2, 'FD');
    doc.text(summaryLines, marginX + 4, y + 5);
    y += sumBoxHeight + 8;
  }

  // --- 6. Question & Explanation Content ---
  checkPageBreak(15);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('QUESTIONS & STEP-BY-STEP EXPLANATIONS', marginX, y);
  y += 2;
  doc.setDrawColor(226, 232, 240);
  doc.line(marginX, y, marginX + contentWidth, y);
  y += 6;

  // Group messages into Q&A pairs
  let questionNumber = 1;
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];

    if (msg.sender === 'user') {
      checkPageBreak(25);
      
      // Question block
      doc.setFillColor(238, 242, 255); // Indigo 50
      doc.setDrawColor(165, 180, 252);
      const qText = cleanMarkdown(msg.message_text || '');
      const qLines = doc.splitTextToSize(qText, contentWidth - 8);
      const qBoxHeight = (qLines.length * 4.8) + 8;

      doc.roundedRect(marginX, y, contentWidth, qBoxHeight, 2, 2, 'FD');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(67, 56, 202);
      doc.text(`Q${questionNumber}:`, marginX + 3.5, y + 5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text(qLines, marginX + 13, y + 5);

      y += qBoxHeight + 4;
      questionNumber++;
    } else if (msg.sender === 'ai' && !msg.is_error) {
      checkPageBreak(30);

      // AI Answer Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      const modeText = msg.mode_used ? `[${msg.mode_used.toUpperCase()} MODE]` : '[VERIFIED AI EXPLANATION]';
      const modelText = msg.model_used ? `Model: ${msg.model_used}` : '';
      doc.text(`AI Solution & Concept Breakdown ${modeText} ${modelText}`, marginX, y);
      y += 4.5;

      // Extract code blocks vs regular paragraphs
      const rawText = msg.message_text || '';
      const chunks = rawText.split(/(```[\s\S]*?```)/g);

      for (const chunk of chunks) {
        if (chunk.startsWith('```') && chunk.endsWith('```')) {
          // Code block rendering
          const codeLinesRaw = chunk.slice(3, -3).trim().split('\n');
          const codeLanguage = codeLinesRaw[0].trim();
          const codeBody = codeLinesRaw.slice(1).join('\n') || codeLinesRaw[0];

          doc.setFont('courier', 'normal');
          doc.setFontSize(8);
          const formattedCodeLines = doc.splitTextToSize(codeBody, contentWidth - 10);
          const codeBoxHeight = (formattedCodeLines.length * 3.8) + 8;

          checkPageBreak(codeBoxHeight + 6);

          doc.setFillColor(30, 41, 59); // Slate 800
          doc.roundedRect(marginX, y, contentWidth, codeBoxHeight, 2, 2, 'F');
          
          doc.setTextColor(148, 163, 184); // Slate 400
          doc.setFontSize(7);
          doc.text(`CODE (${codeLanguage || 'SYNTAX'})`, marginX + 4, y + 4);

          doc.setTextColor(167, 243, 208); // Emerald 200
          doc.setFontSize(8);
          doc.text(formattedCodeLines, marginX + 4, y + 8);

          y += codeBoxHeight + 4;
        } else {
          // Regular text
          const cleanedText = cleanMarkdown(chunk).trim();
          if (!cleanedText) continue;

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(51, 65, 85);

          const paragraphs = cleanedText.split('\n\n');
          for (const para of paragraphs) {
            const pLines = doc.splitTextToSize(para.trim(), contentWidth);
            const pHeight = (pLines.length * 4.2) + 3;
            checkPageBreak(pHeight);

            doc.text(pLines, marginX, y);
            y += pHeight;
          }
        }
      }

      y += 4; // Spacing after answer
    }
  }

  // --- 7. Running Footer on all pages ---
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    
    // Bottom thin line
    doc.setDrawColor(226, 232, 240);
    doc.line(marginX, pageHeight - 12, marginX + contentWidth, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('AI Doubt Solving Platform • Confidential Student Study Material', marginX, pageHeight - 7);
    doc.text(`Page ${p} of ${totalPages}`, marginX + contentWidth - 16, pageHeight - 7);
  }

  const safeTitle = title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40) || 'Study_Notes';
  const filename = `${safeTitle}_${Date.now()}.pdf`;
  const blob = doc.output('blob');

  return {
    doc,
    blob,
    filename,
    download: () => doc.save(filename),
  };
}

/**
 * Generates an official university-grade Mock Exam Paper PDF with optional Solutions & Marking Scheme
 */
export function generateMockExamPDF({
  examData,
  includeSolutions = false,
  studentName = 'Student',
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 16;
  const contentWidth = pageWidth - (marginX * 2);
  let y = 16;

  const checkPageBreak = (neededHeight) => {
    if (y + neededHeight > pageHeight - 18) {
      doc.addPage();
      y = 18;
      // Header bar on continuation pages
      doc.setFillColor(248, 250, 252);
      doc.rect(marginX, 8, contentWidth, 7, 'F');
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `${examData.title || 'Mock Examination'} • ${examData.subject_code || 'GEN'} (Contd.)`,
        marginX + 2,
        12.5
      );
      doc.setFont('helvetica', 'normal');
      return true;
    }
    return false;
  };

  // --- 1. Institutional Exam Top Border ---
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(marginX, y, contentWidth, 3, 'F');
  y += 7;

  // --- 2. University / Faculty Banner ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('INSTITUTE OF ACADEMIC TECHNOLOGY & HIGHER LEARNING', marginX, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('DEPARTMENT OF COMPUTER APPLICATIONS • EXAMINATION DIVISION', marginX, y + 4.5);
  y += 10;

  // --- 3. Exam Title & Mode Badge ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  const title = examData.title || 'AI Mock Examination Paper';
  const titleLines = doc.splitTextToSize(title, contentWidth - 45);
  doc.text(titleLines, marginX, y);

  // Badge on the right
  const badgeText = includeSolutions ? 'WITH SOLUTIONS' : 'QUESTION PAPER';
  const badgeBg = includeSolutions ? [16, 185, 129] : [79, 70, 229]; // Emerald vs Indigo
  doc.setFillColor(...badgeBg);
  doc.roundedRect(marginX + contentWidth - 42, y - 5, 42, 7, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text(badgeText, marginX + contentWidth - 21, y - 0.5, { align: 'center' });

  y += (titleLines.length * 6) + 3;

  // --- 4. Examination Metadata Grid Box ---
  const metaBoxHeight = 22;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(marginX, y, contentWidth, metaBoxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`Subject: ${examData.subject_code || ''} — ${examData.subject_name || 'Academic Course'}`, marginX + 4, y + 6);
  doc.text(`Total Marks: ${examData.total_marks || 30} Marks`, marginX + contentWidth - 40, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Time Allowed: ${examData.time_allowed_minutes || 60} Minutes`, marginX + 4, y + 12);
  doc.text(`Difficulty: ${examData.difficulty || 'Standard University'}`, marginX + 60, y + 12);
  doc.text(`Pattern: ${examData.source_exam_title || 'Database Blueprint'}`, marginX + 115, y + 12);

  doc.text(`Student: ${studentName}`, marginX + 4, y + 17.5);
  doc.text(`Date of Assessment: ${formatDate()}`, marginX + 60, y + 17.5);
  doc.text(`Format: ${examData.mock_type || 'quiz_30'}`, marginX + 115, y + 17.5);

  y += metaBoxHeight + 6;

  // --- 5. Candidate Instructions Box ---
  const instructions = examData.instructions && examData.instructions.length > 0
    ? examData.instructions
    : [
        'Read all instructions and questions carefully before answering.',
        'Illustrate answers with neat diagrams and mathematical formulas wherever appropriate.',
        'Ensure sequential question numbering is maintained strictly.'
      ];

  checkPageBreak(25);
  doc.setFillColor(254, 252, 232); // Light amber
  doc.setDrawColor(254, 240, 138);
  const instBoxHeight = 8 + (instructions.length * 4.2);
  doc.roundedRect(marginX, y, contentWidth, instBoxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(161, 98, 7); // Amber 700
  doc.text('GENERAL INSTRUCTIONS TO CANDIDATES:', marginX + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(113, 63, 18);
  let instY = y + 9.5;
  instructions.forEach((inst, idx) => {
    doc.text(`${idx + 1}.  ${cleanMarkdown(inst)}`, marginX + 5, instY);
    instY += 4.2;
  });

  y += instBoxHeight + 6;

  // --- 6. Sections and Questions ---
  const sections = examData.sections || [];

  sections.forEach((sec, sIdx) => {
    checkPageBreak(25);

    // Section Header Banner
    doc.setFillColor(241, 245, 249); // Slate 100
    doc.setDrawColor(226, 232, 240);
    doc.rect(marginX, y, contentWidth, 8, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${sec.name || `SECTION ${sIdx + 1}`}`, marginX + 4, y + 5.5);

    if (sec.marks) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(79, 70, 229);
      doc.text(`[${sec.marks} MARKS]`, marginX + contentWidth - 25, y + 5.5);
    }

    y += 11;

    if (sec.description) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      const descLines = doc.splitTextToSize(sec.description, contentWidth);
      doc.text(descLines, marginX + 2, y);
      y += (descLines.length * 3.8) + 3;
    }

    // Questions in this section
    const questions = sec.questions || [];
    questions.forEach((q, qIdx) => {
      checkPageBreak(30);

      // Question Number Box + Question Text
      const qNo = q.q_no || `Q${qIdx + 1}`;
      const marksText = `[${q.max_marks || 1} Marks]`;
      const qText = cleanMarkdown(q.text || '');

      // Question badge
      doc.setFillColor(238, 242, 255);
      doc.roundedRect(marginX, y, 22, 6, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(67, 56, 202);
      doc.text(qNo, marginX + 11, y + 4.2, { align: 'center' });

      // Marks on right
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(marksText, marginX + contentWidth - 2, y + 4.2, { align: 'right' });

      // Topic / Unit small tag
      if (q.unit || q.topic) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        const metaStr = `${q.unit || ''} ${q.topic ? '• ' + q.topic : ''} ${q.bloom_level ? '• Bloom: ' + q.bloom_level : ''}`;
        doc.text(metaStr, marginX + 26, y + 4.2);
      }

      y += 8;

      // Question text lines
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      const qLines = doc.splitTextToSize(qText, contentWidth - 4);
      doc.text(qLines, marginX + 2, y);
      y += (qLines.length * 4.6) + 3;

      // Multiple Choice Options (if present)
      if (Array.isArray(q.options) && q.options.length > 0) {
        const optionLetters = ['(A)', '(B)', '(C)', '(D)', '(E)'];
        q.options.forEach((opt, optIdx) => {
          checkPageBreak(8);
          const isCorrect = includeSolutions && optIdx === q.correct_index;
          doc.setFont('helvetica', isCorrect ? 'bold' : 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(isCorrect ? 16 : 51, isCorrect ? 185 : 65, isCorrect ? 129 : 85);

          const optLines = doc.splitTextToSize(`${optionLetters[optIdx] || '•'}  ${cleanMarkdown(opt)}`, contentWidth - 14);
          doc.text(optLines, marginX + 6, y);
          y += (optLines.length * 4.2) + 1.5;
        });
        y += 2;
      }

      // Solutions & Marking Scheme (if enabled)
      if (includeSolutions) {
        checkPageBreak(35);

        // Solution Container
        const solText = cleanMarkdown(q.model_answer || q.explanation || 'Refer to unit lecture notes and textbook derivation.');
        const solLines = doc.splitTextToSize(solText, contentWidth - 12);
        const markingPoints = Array.isArray(q.marking_scheme) ? q.marking_scheme : [];
        const markingHeight = markingPoints.length * 4.2;
        const solBoxHeight = (solLines.length * 4.2) + markingHeight + 14;

        doc.setFillColor(240, 253, 244); // Emerald 50
        doc.setDrawColor(187, 247, 208);
        doc.roundedRect(marginX + 2, y, contentWidth - 4, solBoxHeight, 2, 2, 'FD');

        // Solution Header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(21, 128, 61); // Emerald 700
        doc.text('MODEL SOLUTION & EVALUATION SCHEME:', marginX + 6, y + 5);

        // Model Answer Text
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59);
        doc.text(solLines, marginX + 6, y + 9.5);

        let curSolY = y + 10 + (solLines.length * 4.2);

        // Marking Scheme Breakup
        if (markingPoints.length > 0) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.5);
          doc.setTextColor(15, 118, 110);
          doc.text('Marking Breakdown:', marginX + 6, curSolY);
          curSolY += 4;

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(71, 85, 105);

          markingPoints.forEach((mPoint) => {
            const pText = typeof mPoint === 'string' ? mPoint : `${mPoint.point || mPoint.criterion || 'Step accuracy'} [${mPoint.marks || ''} M]`;
            doc.text(`•  ${cleanMarkdown(pText)}`, marginX + 8, curSolY);
            curSolY += 3.8;
          });
        }

        y += solBoxHeight + 5;
      }

      // Subtle separator between questions
      doc.setDrawColor(241, 245, 249);
      doc.line(marginX + 2, y, marginX + contentWidth - 2, y);
      y += 5;
    });

    y += 4;
  });

  // --- 7. Running Footers on every page ---
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    doc.setDrawColor(226, 232, 240);
    doc.line(marginX, pageHeight - 12, marginX + contentWidth, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'AI Doubt Solving Platform • Collegiate Mock Examination & Syllabus Blueprint System',
      marginX,
      pageHeight - 7
    );
    doc.text(`Page ${p} of ${totalPages}`, marginX + contentWidth - 16, pageHeight - 7);
  }

  const safeTitle = (examData.title || 'Mock_Exam').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
  const suffix = includeSolutions ? 'Solutions' : 'QuestionPaper';
  const filename = `${safeTitle}_${suffix}_${Date.now()}.pdf`;
  const blob = doc.output('blob');

  return {
    doc,
    blob,
    filename,
    download: () => doc.save(filename),
  };
}

