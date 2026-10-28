    if (window.tailwind) tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'system-ui', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace'],
          },
          colors: {
            gov: {
              slate: '#0F172A',
              navy: '#1E3A8A',
              saffron: '#D97706',
              bg: '#F8FAFC',
              emerald: '#15803D',
              crimson: '#B91C1C'
            }
          }
        }
      }
    }
  

    // -------------------------------------------------------------------------
    // 1. MASTER INSTITUTION 360° DATASET
    //    Includes the 5 named flagship institutions + additional flagged ones
    //    representing the 27 flagged institutions across AICTE.
    // -------------------------------------------------------------------------
    const institutionsData = [
      {
        aicteId: '1-482910412',
        name: 'Satpura Institute of Engineering & Tech',
        city: 'Bhopal',
        state: 'Madhya Pradesh',
        region: 'Central (Bhopal RO)',
        type: 'Private Self-Financed',
        intake: 1140,
        riskScore: 92,
        eoaStatus: 'EoA 2026-27 Under Hold',
        eoaHold: true,
        holdReason: 'Extension of Approval (EoA) Flagged by Public Grievance + Regulation + Vigilance Bureaus',
        summary: 'Multiple high-severity complaints regarding 7 months unpaid faculty salaries in Grievance Cell alongside suspected forged payroll affidavits submitted to Approval Bureau for EoA renewal.'
      },
      {
        aicteId: '1-391048219',
        name: 'Gandak Valley Institute of Technology',
        city: 'Muzaffarpur',
        state: 'Bihar',
        region: 'Eastern (Kolkata RO)',
        type: 'Private Self-Financed',
        intake: 780,
        riskScore: 88,
        eoaStatus: 'Standing Hearing Committee (SHC)',
        eoaHold: true,
        holdReason: 'Flagged by Anti-Ragging Cell + Approval Bureau (Hostel Safety & Lab Deficit)',
        summary: 'Severe hostel ragging complaint under active investigation in Anti-Ragging Cell while physical EVC audit flagged 42% shortage in core Mechanical & AI/ML laboratory equipment.'
      },
      {
        aicteId: '1-772819304',
        name: 'Utkal Regional College of Management',
        city: 'Bhubaneswar',
        state: 'Odisha',
        region: 'Eastern (Kolkata RO)',
        type: 'Private PGDM Institution',
        intake: 420,
        riskScore: 84,
        eoaStatus: 'EoA Flagged for Audit',
        eoaHold: true,
        holdReason: 'Flagged by Regulation Bureau + Finance Bureau (Unapproved Intake & Fee Capitation)',
        summary: 'Admitted 65 excess students beyond AICTE sanctioned intake and collected unreceipted development fees; linked to PG scholarship utilization discrepancy in Finance Bureau.'
      },
      {
        aicteId: '1-619283745',
        name: 'Shivalik Foothills School of Architecture',
        city: 'Dehradun',
        state: 'Uttarakhand',
        region: 'Northern (Kanpur RO)',
        type: 'Private Technical Institution',
        intake: 300,
        riskScore: 79,
        eoaStatus: 'Show Cause Notice Issued',
        eoaHold: true,
        holdReason: 'Flagged by Approval Bureau + Public Grievance Cell (Fire Safety NOC Expiry & Original Certificates Withheld)',
        summary: 'Municipal Fire Safety NOC expired 11 months ago; students also filed CPGRAMS grievances regarding withholding of original mark sheets and security deposits.'
      },
      {
        aicteId: '1-502938471',
        name: 'Malwa Plateau Institute of Technology',
        city: 'Indore',
        state: 'Madhya Pradesh',
        region: 'Central (Bhopal RO)',
        type: 'Private Self-Financed',
        intake: 960,
        riskScore: 86,
        eoaStatus: 'EoA 2026-27 Under Hold',
        eoaHold: true,
        holdReason: 'Flagged by Vigilance / CVC Cell + Public Grievance Cell + Finance Bureau',
        summary: 'CVC vigilance reference regarding duplicate faculty PAN entries (Ghost Faculty) appearing simultaneously on two college rosters, coupled with faculty PF/salary arrears.'
      },
      {
        aicteId: '1-883920114',
        name: 'Cauvery Delta College of Pharmacy & Tech',
        city: 'Tiruchirappalli',
        state: 'Tamil Nadu',
        region: 'Southern (Chennai RO)',
        type: 'Private Self-Financed',
        intake: 540,
        riskScore: 73,
        eoaStatus: 'Conditional EoA Review',
        eoaHold: false,
        holdReason: 'Monitored by Regulation Bureau + Grievance Cell',
        summary: 'Complaints regarding Principal qualification norms and delayed refund of admission cancellation fees under AICTE fee refund policy.'
      },
      {
        aicteId: '1-912039485',
        name: 'Deccan Institute of Aeronautical & Tech',
        city: 'Hyderabad',
        state: 'Telangana',
        region: 'South-Central (Hyderabad RO)',
        type: 'Private Self-Financed',
        intake: 840,
        riskScore: 81,
        eoaStatus: 'EoA 2026-27 Under Hold',
        eoaHold: true,
        holdReason: 'Flagged by Approval Bureau + Anti-Ragging Cell',
        summary: 'Deficit in propulsion lab safety compliance and non-constitution of statutory Anti-Ragging Squad as mandated by AICTE regulations.'
      },
      {
        aicteId: '1-204918273',
        name: 'Sahyadri Coastal College of Engineering',
        city: 'Ratnagiri',
        state: 'Maharashtra',
        region: 'Western (Mumbai RO)',
        type: 'Private Self-Financed',
        intake: 600,
        riskScore: 68,
        eoaStatus: 'EoA Active (Under Watch)',
        eoaHold: false,
        holdReason: 'Monitored by Finance Bureau + Public Grievance Cell',
        summary: 'Delayed disbursement of AICTE Pragati & Saksham scholarship verification at institute nodal level.'
      }
    ];

    // -------------------------------------------------------------------------
    // 2. MASTER COMPLAINT CASES DATASET
    //    Includes exact required Case IDs (CMP-2026-0015, CMP-2026-0021,
    //    CMP-2026-0043, CMP-2026-0068, CMP-2026-0066, CMP-2026-0076,
    //    CMP-2026-0042, CMP-2026-0038, etc.) plus additional cases.
    //    Baseline KPI totals are calibrated to:
    //    Total: 76, Open: 56, Resolved/Closed: 20, Overdue: 22,
    //    Institutions Flagged: 27, High/Critical: 19
    // -------------------------------------------------------------------------
    let casesData = [
      {
        caseId: 'CMP-2026-0015',
        aicteId: '1-482910412',
        institutionName: 'Satpura Institute of Engineering & Tech',
        bureau: 'Public Grievance Cell',
        category: 'Faculty Salary Non-Payment',
        title: 'Non-payment of faculty salaries for 7 consecutive months across CSE & ECE departments',
        priority: 'Critical',
        status: 'In Progress',
        officer: 'Shri A. K. Sharma (Grievance Nodal)',
        source: 'CPGRAMS',
        complainant: 'Faculty Member (18 Joint Signatories)',
        filedDate: '2026-05-15',
        dueDate: '2026-06-20',
        overdueDays: 127,
        isOverdue: true,
        linkedCases: ['CMP-2026-0021', 'CMP-2026-0068'],
        resolutionNotes: 'Show-cause notice issued on 2026-07-02; awaiting bank statement verification from State DTE.'
      },
      {
        caseId: 'CMP-2026-0021',
        aicteId: '1-482910412',
        institutionName: 'Satpura Institute of Engineering & Tech',
        bureau: 'Approval Bureau',
        category: 'Unapproved Intake',
        title: 'Suspected fabricated salary acquaintance roll & Form-16 uploaded for AY 2026-27 EoA renewal',
        priority: 'Critical',
        status: 'Under Review',
        officer: 'Dr. Meenakshi Iyer (EoA Scrutiny)',
        source: 'EoA Scrutiny',
        complainant: 'EVC Inspection Team',
        filedDate: '2026-06-10',
        dueDate: '2026-07-15',
        overdueDays: 102,
        isOverdue: true,
        linkedCases: ['CMP-2026-0015', 'CMP-2026-0068'],
        resolutionNotes: 'Cross-flagged with CMP-2026-0015 in Public Grievance Cell. EoA placed on hold pending Standing Hearing Committee.'
      },
      {
        caseId: 'CMP-2026-0043',
        aicteId: '1-391048219',
        institutionName: 'Gandak Valley Institute of Technology',
        bureau: 'Anti-Ragging Cell',
        category: 'Ragging / Hostel Safety',
        title: 'Severe ragging and physical intimidation reported in Boys Hostel Block-C; FIR copy attached',
        priority: 'Critical',
        status: 'In Progress',
        officer: 'Prof. S. N. Banerjee (Anti-Ragging Desk)',
        source: 'Anti-Ragging Helpline',
        complainant: 'Student / Parent',
        filedDate: '2026-07-12',
        dueDate: '2026-07-26',
        overdueDays: 91,
        isOverdue: true,
        linkedCases: ['CMP-2026-0066'],
        resolutionNotes: 'Surprise inspection ordered; institute failed to submit CCTV footage within 48-hour statutory window.'
      },
      {
        caseId: 'CMP-2026-0068',
        aicteId: '1-482910412',
        institutionName: 'Satpura Institute of Engineering & Tech',
        bureau: 'Vigilance / CVC Cell',
        category: 'Faculty Salary Non-Payment',
        title: 'Whistleblower tip on diversion of student tuition fee escrow account & forged bank certificate',
        priority: 'Critical',
        status: 'Under Review',
        officer: 'Shri Vikramaditya Rao (CVC Liaison)',
        source: 'Vigilance Tip',
        complainant: 'Whistleblower (Anonymous)',
        filedDate: '2026-07-28',
        dueDate: '2026-08-18',
        overdueDays: 68,
        isOverdue: true,
        linkedCases: ['CMP-2026-0015', 'CMP-2026-0021'],
        resolutionNotes: 'Forensic audit of bank scroll initiated jointly with Regulation & Approval Bureaus.'
      },
      {
        caseId: 'CMP-2026-0066',
        aicteId: '1-391048219',
        institutionName: 'Gandak Valley Institute of Technology',
        bureau: 'Approval Bureau',
        category: 'Lab Infrastructure Deficit',
        title: 'EVC surprise audit found 42% deficit in CAD/CAM & High-Voltage Lab equipment and non-functional warden cell',
        priority: 'High',
        status: 'Awaiting Information',
        officer: 'Dr. Meenakshi Iyer (EoA Scrutiny)',
        source: 'EoA Scrutiny',
        complainant: 'EVC Inspection Team',
        filedDate: '2026-08-02',
        dueDate: '2026-08-30',
        overdueDays: 56,
        isOverdue: true,
        linkedCases: ['CMP-2026-0043'],
        resolutionNotes: 'Compliance affidavit requested from Principal; linked to hostel governance failure in CMP-2026-0043.'
      },
      {
        caseId: 'CMP-2026-0076',
        aicteId: '1-772819304',
        institutionName: 'Utkal Regional College of Management',
        bureau: 'Regulation Bureau',
        category: 'Unapproved Intake',
        title: 'Admission of 65 excess PGDM students above AICTE approved intake of 420 for AY 2026-27',
        priority: 'Critical',
        status: 'In Progress',
        officer: 'Smt. Kavita Deshmukh (Regulation)',
        source: 'State DTE Referral',
        complainant: 'State DTE Officer',
        filedDate: '2026-08-14',
        dueDate: '2026-09-05',
        overdueDays: 50,
        isOverdue: true,
        linkedCases: ['CMP-2026-0042'],
        resolutionNotes: 'Penalty calculation under AICTE Approval Process Handbook Chapter VIII initiated.'
      },
      {
        caseId: 'CMP-2026-0042',
        aicteId: '1-772819304',
        institutionName: 'Utkal Regional College of Management',
        bureau: 'Finance Bureau',
        category: 'Fee Structure Violation',
        title: 'Collection of unreceipted capitation fee of ₹85,000 per student & mismatch in scholarship utilization certificate',
        priority: 'High',
        status: 'Under Review',
        officer: 'Shri P. Chidambaram Nair (Finance Cell)',
        source: 'CPGRAMS',
        complainant: 'Student / Parent',
        filedDate: '2026-08-19',
        dueDate: '2026-09-12',
        overdueDays: 43,
        isOverdue: true,
        linkedCases: ['CMP-2026-0076'],
        resolutionNotes: 'Fee Regulatory Committee report sought from Odisha State Government.'
      },
      {
        caseId: 'CMP-2026-0038',
        aicteId: '1-619283745',
        institutionName: 'Shivalik Foothills School of Architecture',
        bureau: 'Approval Bureau',
        category: 'Fire Safety Expiry',
        title: 'Municipal Fire & Structural Safety NOC expired in Nov 2025; renewal certificate not uploaded on AICTE portal',
        priority: 'High',
        status: 'Awaiting Information',
        officer: 'Dr. R. K. Verma (Nodal Desk)',
        source: 'EoA Scrutiny',
        complainant: 'EVC Inspection Team',
        filedDate: '2026-08-25',
        dueDate: '2026-09-20',
        overdueDays: 35,
        isOverdue: true,
        linkedCases: ['CMP-2026-0051'],
        resolutionNotes: 'Final 7-day reminder issued before placing institution under No-Admission category.'
      },
      {
        caseId: 'CMP-2026-0051',
        aicteId: '1-619283745',
        institutionName: 'Shivalik Foothills School of Architecture',
        bureau: 'Public Grievance Cell',
        category: 'Fee Structure Violation',
        title: 'Withholding of original 10th/12th mark sheets and refusal to refund fee upon student withdrawal within counseling deadline',
        priority: 'High',
        status: 'In Progress',
        officer: 'Shri A. K. Sharma (Grievance Nodal)',
        source: 'AICTE Portal',
        complainant: 'Student / Parent',
        filedDate: '2026-09-01',
        dueDate: '2026-09-28',
        overdueDays: 27,
        isOverdue: true,
        linkedCases: ['CMP-2026-0038'],
        resolutionNotes: 'Directed Registrar to return original certificates within 72 hours per AICTE mandatory norms.'
      },
      {
        caseId: 'CMP-2026-0059',
        aicteId: '1-502938471',
        institutionName: 'Malwa Plateau Institute of Technology',
        bureau: 'Vigilance / CVC Cell',
        category: 'Unapproved Intake',
        title: '24 Faculty PAN & Aadhaar IDs found duplicated across two sister institutions during biometric deduplication',
        priority: 'Critical',
        status: 'In Progress',
        officer: 'Shri Vikramaditya Rao (CVC Liaison)',
        source: 'Vigilance Tip',
        complainant: 'EVC Inspection Team',
        filedDate: '2026-09-05',
        dueDate: '2026-09-30',
        overdueDays: 25,
        isOverdue: true,
        linkedCases: ['CMP-2026-0063'],
        resolutionNotes: 'Biometric attendance logs and EPFO challans summoned from Regional PF Commissioner.'
      },
      {
        caseId: 'CMP-2026-0063',
        aicteId: '1-502938471',
        institutionName: 'Malwa Plateau Institute of Technology',
        bureau: 'Public Grievance Cell',
        category: 'Faculty Salary Non-Payment',
        title: 'Deduction of 40% salary under guise of research development fund and non-deposit of EPF for 14 months',
        priority: 'High',
        status: 'Submitted',
        officer: 'Shri A. K. Sharma (Grievance Nodal)',
        source: 'CPGRAMS',
        complainant: 'Faculty Member',
        filedDate: '2026-09-12',
        dueDate: '2026-10-08',
        overdueDays: 17,
        isOverdue: true,
        linkedCases: ['CMP-2026-0059'],
        resolutionNotes: 'Assigned to Nodal Grievance Officer; AI engine linked with Vigilance Ghost Faculty case CMP-2026-0059.'
      },
      {
        caseId: 'CMP-2026-0071',
        aicteId: '1-912039485',
        institutionName: 'Deccan Institute of Aeronautical & Tech',
        bureau: 'Approval Bureau',
        category: 'Lab Infrastructure Deficit',
        title: 'Sub-sonic wind tunnel and avionics simulation lab non-operational during academic inspection',
        priority: 'High',
        status: 'In Progress',
        officer: 'Dr. Meenakshi Iyer (EoA Scrutiny)',
        source: 'EoA Scrutiny',
        complainant: 'EVC Inspection Team',
        filedDate: '2026-09-18',
        dueDate: '2026-10-15',
        overdueDays: 10,
        isOverdue: true,
        linkedCases: ['CMP-2026-0074'],
        resolutionNotes: 'Deficiency report uploaded; awaiting compliance video geo-tagged verification.'
      },
      {
        caseId: 'CMP-2026-0074',
        aicteId: '1-912039485',
        institutionName: 'Deccan Institute of Aeronautical & Tech',
        bureau: 'Anti-Ragging Cell',
        category: 'Ragging / Hostel Safety',
        title: 'Non-constitution of Anti-Ragging Monitoring Cell and absence of warden in off-campus leased hostel',
        priority: 'Medium',
        status: 'Under Review',
        officer: 'Prof. S. N. Banerjee (Anti-Ragging Desk)',
        source: 'Anti-Ragging Helpline',
        complainant: 'Student / Parent',
        filedDate: '2026-10-02',
        dueDate: '2026-11-02',
        overdueDays: 0,
        isOverdue: false,
        linkedCases: ['CMP-2026-0071'],
        resolutionNotes: 'Notice served to Director; 8 days remaining in SLA window.'
      },
      {
        caseId: 'CMP-2026-0029',
        aicteId: '1-883920114',
        institutionName: 'Cauvery Delta College of Pharmacy & Tech',
        bureau: 'Regulation Bureau',
        category: 'Unapproved Intake',
        title: 'Faculty-to-student ratio fell below 1:20 in B.Pharm program after 9 senior faculty resignations',
        priority: 'Medium',
        status: 'In Progress',
        officer: 'Smt. Kavita Deshmukh (Regulation)',
        source: 'State DTE Referral',
        complainant: 'State DTE Officer',
        filedDate: '2026-10-05',
        dueDate: '2026-11-05',
        overdueDays: 0,
        isOverdue: false,
        linkedCases: ['CMP-2026-0033'],
        resolutionNotes: 'Recruitment advertisement and university selection committee minutes requested.'
      },
      {
        caseId: 'CMP-2026-0033',
        aicteId: '1-883920114',
        institutionName: 'Cauvery Delta College of Pharmacy & Tech',
        bureau: 'Public Grievance Cell',
        category: 'Fee Structure Violation',
        title: 'Refund of ₹62,000 tuition fee resolved after AICTE Grievance Cell intervention',
        priority: 'Medium',
        status: 'Resolved',
        officer: 'Shri A. K. Sharma (Grievance Nodal)',
        source: 'AICTE Portal',
        complainant: 'Student / Parent',
        filedDate: '2026-08-10',
        dueDate: '2026-09-10',
        overdueDays: 0,
        isOverdue: false,
        linkedCases: ['CMP-2026-0029'],
        resolutionNotes: 'Verified NEFT UTR #SBIN26249103845 of ₹62,000 credited to complainant student bank account on 2026-09-06.'
      },
      {
        caseId: 'CMP-2026-0019',
        aicteId: '1-204918273',
        institutionName: 'Sahyadri Coastal College of Engineering',
        bureau: 'Finance Bureau',
        category: 'Fee Structure Violation',
        title: 'AICTE Pragati Scholarship batch verification completed and released for 14 female engineering students',
        priority: 'Low',
        status: 'Closed',
        officer: 'Shri P. Chidambaram Nair (Finance Cell)',
        source: 'AICTE Portal',
        complainant: 'Student / Parent',
        filedDate: '2026-07-15',
        dueDate: '2026-08-15',
        overdueDays: 0,
        isOverdue: false,
        linkedCases: [],
        resolutionNotes: 'PFMS disbursement batch #PFMS-2026-99812 verified and settled. Case closed with complainant confirmation.'
      }
    ];

    // Baseline KPI counters (Total=76, Open=56, Resolved=20, Overdue=22, Flagged=27, High/Critical=19)
    // Whenever the user adds or resolves a case in the UI, we adjust these deltas live!
    let dashboardMetrics = { total: 0, open: 0, resolved: 0, overdue: 0, institutions_flagged: 0, critical: 0 };
    let analyticsData = null;

    // -------------------------------------------------------------------------
    // 3. AI CROSS-BUREAU CASE LINKER SUGGESTIONS DATASET
    // -------------------------------------------------------------------------
    let aiSuggestionsData = [
      {
        id: 'AI-LINK-101',
        similarity: 94,
        relationshipType: 'Cross-Bureau Causal Link',
        state: 'Pending Review',
        aicteId: '1-482910412',
        institutionName: 'Satpura Institute of Engineering & Tech',
        caseA: {
          id: 'CMP-2026-0015',
          bureau: 'Public Grievance Cell',
          summary: 'Non-payment of faculty salaries for 7 consecutive months across CSE & ECE departments (CPGRAMS)'
        },
        caseB: {
          id: 'CMP-2026-0021',
          bureau: 'Approval Bureau',
          summary: 'Suspected fabricated salary acquaintance roll & Form-16 uploaded for AY 2026-27 EoA renewal'
        },
        matchedEntities: ['AICTE PID: 1-482910412', 'Faculty Salary Payroll', 'CSE/ECE Roster', 'AY 2026-27 Affidavit'],
        aiExplanation: 'High-confidence contradiction: Institution claims 100% salary disbursement in Approval Bureau EoA affidavit while 18 faculty members have active unpaid salary grievances in Public Grievance Cell.'
      },
      {
        id: 'AI-LINK-102',
        similarity: 91,
        relationshipType: 'Escalation Cluster',
        state: 'Pending Review',
        aicteId: '1-482910412',
        institutionName: 'Satpura Institute of Engineering & Tech',
        caseA: {
          id: 'CMP-2026-0021',
          bureau: 'Approval Bureau',
          summary: 'Suspected fabricated salary acquaintance roll uploaded for EoA renewal'
        },
        caseB: {
          id: 'CMP-2026-0068',
          bureau: 'Vigilance / CVC Cell',
          summary: 'Whistleblower tip on diversion of student tuition fee escrow account & forged bank certificate'
        },
        matchedEntities: ['AICTE PID: 1-482910412', 'Forged Bank Scroll', 'Escrow Account Diversion'],
        aiExplanation: 'CVC Vigilance tip corroborates the forged bank salary certificate flagged during Approval Bureau EoA scrutiny.'
      },
      {
        id: 'AI-LINK-103',
        similarity: 89,
        relationshipType: 'Cross-Bureau Causal Link',
        state: 'Pending Review',
        aicteId: '1-502938471',
        institutionName: 'Malwa Plateau Institute of Technology',
        caseA: {
          id: 'CMP-2026-0059',
          bureau: 'Vigilance / CVC Cell',
          summary: '24 Faculty PAN & Aadhaar IDs found duplicated across two sister institutions (Ghost Faculty)'
        },
        caseB: {
          id: 'CMP-2026-0063',
          bureau: 'Public Grievance Cell',
          summary: 'Deduction of 40% salary under guise of research fund and non-deposit of EPF for 14 months'
        },
        matchedEntities: ['AICTE PID: 1-502938471', 'EPFO Challan Mismatch', 'Faculty PAN Roster'],
        aiExplanation: 'EPFO non-deposit in Grievance Cell directly correlates with ghost faculty PAN duplication under investigation by Vigilance Cell.'
      },
      {
        id: 'AI-LINK-104',
        similarity: 87,
        relationshipType: 'Cross-Bureau Causal Link',
        state: 'Pending Review',
        aicteId: '1-772819304',
        institutionName: 'Utkal Regional College of Management',
        caseA: {
          id: 'CMP-2026-0076',
          bureau: 'Regulation Bureau',
          summary: 'Admission of 65 excess PGDM students above AICTE approved intake of 420'
        },
        caseB: {
          id: 'CMP-2026-0042',
          bureau: 'Finance Bureau',
          summary: 'Collection of unreceipted capitation fee of ₹85,000/student & scholarship utilization mismatch'
        },
        matchedEntities: ['AICTE PID: 1-772819304', 'PGDM Batch 2026', 'Unapproved Excess Admissions'],
        aiExplanation: 'Excess unapproved admissions in Regulation Bureau explain the unreceipted capitation fee complaints filed with Finance Bureau.'
      },
      {
        id: 'AI-LINK-105',
        similarity: 93,
        relationshipType: 'Duplicate',
        state: 'Pending Review',
        aicteId: '1-482910412',
        institutionName: 'Satpura Institute of Engineering & Tech',
        caseA: {
          id: 'CMP-2026-0015',
          bureau: 'Public Grievance Cell',
          summary: 'CPGRAMS grievance: Non-payment of faculty salaries for 7 consecutive months (CSE/ECE)'
        },
        caseB: {
          id: 'CMP-2026-0068',
          bureau: 'Vigilance / CVC Cell',
          summary: 'Direct portal duplicate submission by same faculty group regarding 7-month salary arrears'
        },
        matchedEntities: ['AICTE PID: 1-482910412', '93% Text Overlap', 'Same 18 Signatories'],
        aiExplanation: 'Near-identical complaint text submitted via both CPGRAMS and AICTE Vigilance portal within 72 hours.'
      },
      {
        id: 'AI-LINK-106',
        similarity: 84,
        relationshipType: 'Cross-Bureau Causal Link',
        state: 'Pending Review',
        aicteId: '1-391048219',
        institutionName: 'Gandak Valley Institute of Technology',
        caseA: {
          id: 'CMP-2026-0043',
          bureau: 'Anti-Ragging Cell',
          summary: 'Severe ragging and physical intimidation reported in Boys Hostel Block-C'
        },
        caseB: {
          id: 'CMP-2026-0066',
          bureau: 'Approval Bureau',
          summary: 'EVC surprise audit found 42% lab deficit and non-functional hostel warden cell'
        },
        matchedEntities: ['AICTE PID: 1-391048219', 'Hostel Block-C Governance', 'Warden Absence'],
        aiExplanation: 'EVC inspection finding of absent hostel warden in Approval Bureau substantiates the Anti-Ragging Cell incident.'
      },
      {
        id: 'AI-LINK-107',
        similarity: 82,
        relationshipType: 'Cross-Bureau Causal Link',
        state: 'Confirmed Link',
        aicteId: '1-619283745',
        institutionName: 'Shivalik Foothills School of Architecture',
        caseA: {
          id: 'CMP-2026-0038',
          bureau: 'Approval Bureau',
          summary: 'Municipal Fire & Structural Safety NOC expired in Nov 2025'
        },
        caseB: {
          id: 'CMP-2026-0051',
          bureau: 'Public Grievance Cell',
          summary: 'Withholding of original certificates upon student withdrawal citing campus safety concerns'
        },
        matchedEntities: ['AICTE PID: 1-619283745', 'Campus Fire Safety', 'Student Withdrawal'],
        aiExplanation: 'Students withdrew admission citing unsafe building conditions (expired Fire NOC) and were denied certificate return.'
      }
    ];

    // -------------------------------------------------------------------------
    // 4. AUDIT EVENT HISTORY DATASET
    // -------------------------------------------------------------------------
    let auditLogsData = [
      {
        timestamp: '2026-10-25 22:48:12',
        actionType: 'STATUS_CHANGED',
        entityId: 'CMP-2026-0038',
        actor: 'Dr. R. K. Verma',
        bureau: 'Approval Bureau',
        diff: 'Status: Under Review → Awaiting Information | Final 7-day Show Cause Notice served for expired Fire Safety NOC.',
        hash: '0x9f81c4a2...3e19',
        isNew: false
      },
      {
        timestamp: '2026-10-25 21:15:04',
        actionType: 'RELATIONSHIP_LINKED',
        entityId: 'CMP-2026-0038 ↔ CMP-2026-0051',
        actor: 'Dr. R. K. Verma',
        bureau: 'Approval Bureau',
        diff: 'AI-LINK-107 Confirmed (82% Match) | Linked Approval Bureau Fire NOC case with Grievance Cell Certificate Withholding case.',
        hash: '0x4b29e8d1...7a02',
        isNew: false
      },
      {
        timestamp: '2026-10-25 19:40:51',
        actionType: 'NOTE_ADDED',
        entityId: 'CMP-2026-0015',
        actor: 'Shri A. K. Sharma',
        bureau: 'Public Grievance Cell',
        diff: 'Added Verification Note: "State DTE Madhya Pradesh directed to verify bank salary scroll of Satpura Institute within 5 working days."',
        hash: '0x7c12a9f0...8b44',
        isNew: false
      },
      {
        timestamp: '2026-10-25 18:22:30',
        actionType: 'SUGGESTIONS_REFRESHED',
        entityId: 'ENGINE-BATCH-2026-10',
        actor: 'System Cron / NLP Engine',
        bureau: 'AI Correlation Engine',
        diff: 'Scanned 76 active & historical cases across 6 bureaus | Identified 6 pending cross-bureau causal & duplicate links.',
        hash: '0x2d90f1c3...5e61',
        isNew: false
      },
      {
        timestamp: '2026-10-25 16:05:19',
        actionType: 'BUREAU_ESCALATION',
        entityId: 'CMP-2026-0021',
        actor: 'Dr. Meenakshi Iyer',
        bureau: 'Approval Bureau',
        diff: 'Escalated AICTE PID 1-482910412 to Standing Hearing Committee (SHC) & placed EoA 2026-27 on Hold due to CMP-2026-0015.',
        hash: '0x6a31b7e8...9d10',
        isNew: false
      },
      {
        timestamp: '2026-10-25 14:50:08',
        actionType: 'STATUS_CHANGED',
        entityId: 'CMP-2026-0033',
        actor: 'Shri A. K. Sharma',
        bureau: 'Public Grievance Cell',
        diff: 'Status: In Progress → Resolved | Verified NEFT UTR #SBIN26249103845 of ₹62,000 fee refund to student.',
        hash: '0x1e55d2a9...4c87',
        isNew: false
      },
      {
        timestamp: '2026-10-25 11:32:44',
        actionType: 'NOTE_ADDED',
        entityId: 'CMP-2026-0043',
        actor: 'Prof. S. N. Banerjee',
        bureau: 'Anti-Ragging Cell',
        diff: 'Added Urgent Note: "District SP & University Registrar notified regarding Gandak Valley Hostel Block-C ragging FIR."',
        hash: '0x8c74e0b1...2f33',
        isNew: false
      },
      {
        timestamp: '2026-10-24 17:19:02',
        actionType: 'STATUS_CHANGED',
        entityId: 'CMP-2026-0076',
        actor: 'Smt. Kavita Deshmukh',
        bureau: 'Regulation Bureau',
        diff: 'Status: Under Review → In Progress | Initiated excess admission penalty computation for Utkal Regional College.',
        hash: '0x5a09c8e4...1b29',
        isNew: false
      }
    ];

    // Currently selected states
    let currentScreen = 'command';
    let currentRole = 'ALL';
    let selectedInstitutionId = '1-482910412';
    let selectedCaseId = 'CMP-2026-0015';
    let backendAvailable = false;
    let backendCaseLinks = [];
    let lastSyncedAt = null;
    let syncInFlight = null;
    let workflowHistoryRequest = 0;
    let workflowDraft = null;
    const pendingApiActions = new Set();
    let bureausData = [
      { code: 'public-grievance', name: 'Public Grievance Cell' },
      { code: 'approval', name: 'Approval Bureau' },
      { code: 'regulation', name: 'Regulation Bureau' },
      { code: 'anti-ragging', name: 'Anti-Ragging Cell' },
      { code: 'vigilance-cvc', name: 'Vigilance / CVC Cell' },
      { code: 'finance', name: 'Finance Bureau' }
    ];
    const backendApiBaseUrl = window.AICTE_API_BASE_URL ||
      (window.location.protocol === 'file:' || window.location.port === '8000'
        ? `http://${window.location.hostname || '127.0.0.1'}:8001/api`
        : `${window.location.origin}/api`);

    async function apiRequest(path, options = {}) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      let response;
      const responseType = options.responseType;
      const requestOptions = { ...options };
      delete requestOptions.responseType;
      try {
        response = await fetch(`${backendApiBaseUrl}${path}`, {
          ...requestOptions, signal: controller.signal,
          headers: { ...(requestOptions.body ? { 'Content-Type': 'application/json' } : {}), ...(requestOptions.headers || {}) }
        });
      } catch (error) {
        const wrapped = new Error(error.name === 'AbortError'
          ? 'The API request timed out after 15 seconds.'
          : `Cannot connect to the API at ${backendApiBaseUrl}. Start the backend and check the API URL.`);
        wrapped.kind = error.name === 'AbortError' ? 'timeout' : 'network';
        throw wrapped;
      } finally { clearTimeout(timer); }
      const raw = await response.text();
      let body = null;
      if (raw) {
        try { body = JSON.parse(raw); } catch { body = { detail: raw }; }
      }
      if (!response.ok) {
        const detail = body?.detail;
        const message = Array.isArray(detail)
          ? detail.map(item => `${(item.loc || []).slice(-1)[0] || 'value'}: ${item.msg}`).join('; ')
          : typeof detail === 'string' ? detail : `${response.status} ${response.statusText}`;
        const wrapped = new Error(message);
        wrapped.status = response.status;
        wrapped.kind = response.status === 404 ? 'not-found' : response.status === 422 ? 'validation' : response.status >= 500 ? 'server' : 'http';
        throw wrapped;
      }
      return responseType === 'text' ? raw : body;
    }

    function setApiConnectionStatus(state, detail = '') {
      const badge = document.getElementById('apiConnectionStatus');
      const dot = document.getElementById('apiConnectionDot');
      if (!badge || !dot) return;
      const states = {
        connecting: ['API: CONNECTING', 'text-amber-300 bg-amber-950/80 border-amber-700/50', 'bg-amber-300 animate-pulse'],
        syncing: ['API: SYNCING', 'text-amber-300 bg-amber-950/80 border-amber-700/50', 'bg-amber-300 animate-pulse'],
        online: ['API: ONLINE', 'text-emerald-400 bg-emerald-950/80 border-emerald-700/50', 'bg-emerald-400 animate-ping'],
        stale: ['API: STALE DATA', 'text-amber-300 bg-amber-950/80 border-amber-700/50', 'bg-amber-300'],
        offline: ['API: OFFLINE', 'text-rose-300 bg-rose-950/80 border-rose-700/50', 'bg-rose-400']
      };
      const [label, colors, dotColors] = states[state] || states.offline;
      badge.textContent = label;
      badge.className = `hidden md:inline-flex items-center gap-1.5 text-[11px] font-mono-code border px-2 py-0.5 rounded ${colors}`;
      dot.className = `w-1.5 h-1.5 rounded-full ${dotColors}`;
      const syncLabel = lastSyncedAt ? `Last successful sync: ${lastSyncedAt.toLocaleString()}.` : 'No successful sync yet.';
      badge.title = [detail, syncLabel].filter(Boolean).join(' ');
    }

    function mapBackendInstitution(row) {
      return {
        aicteId: row.aicte_id,
        name: row.name,
        city: row.city,
        state: row.state,
        region: row.region,
        type: row.institution_type,
        intake: row.intake,
        riskScore: row.risk_score,
        eoaStatus: row.eoa_status,
        eoaHold: row.eoa_hold,
        holdReason: row.hold_reason,
        summary: row.summary,
        isDemo: row.is_demo
      };
    }

    function mapBackendComplaint(row) {
      return {
        caseId: row.case_id,
        aicteId: row.institution_id,
        institutionName: row.institution_name,
        bureau: row.bureau,
        bureauCode: row.bureau_code,
        category: row.category,
        title: row.title,
        priority: row.priority,
        status: row.status,
        officer: row.assigned_officer,
        source: row.source,
        complainant: row.complainant,
        filedDate: row.filed_date,
        dueDate: row.due_date,
        overdueDays: row.overdue_days,
        isOverdue: row.is_overdue,
        linkedCases: row.linked_cases || [],
        resolutionNotes: row.resolution_notes || '',
        isDemo: row.is_demo
      };
    }

    function mapBackendAudit(row) {
      const date = new Date(row.occurred_at);
      const timestamp = Number.isNaN(date.getTime())
        ? row.occurred_at
        : new Intl.DateTimeFormat('en-IN', {
          timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        }).format(date).replace(',', '');
      return {
        eventId: row.id,
        timestamp,
        actionType: row.action_type,
        entityId: row.entity_id,
        actor: row.actor || 'System',
        bureau: row.bureau,
        diff: row.details,
        isNew: !row.is_demo,
        isDemo: row.is_demo
      };
    }

    async function syncBackendData() {
      if (syncInFlight) return syncInFlight;
      syncInFlight = (async () => {
        const [institutions, complaints, bureaus, auditEvents, caseLinks, suggestions, analytics] = await Promise.all([
          apiRequest('/institutions'),
          apiRequest('/complaints'),
          apiRequest('/bureaus'),
          apiRequest('/audit-events'),
          apiRequest('/case-links'),
          apiRequest('/case-links/suggestions'),
          apiRequest('/analytics')
        ]);
        institutionsData.splice(0, institutionsData.length, ...institutions.map(mapBackendInstitution));
        casesData = complaints.map(mapBackendComplaint);
        bureausData = bureaus;
        auditLogsData = auditEvents.map(mapBackendAudit);
        backendCaseLinks = caseLinks;
        aiSuggestionsData = suggestions;
        analyticsData = analytics;
        recomputeKpiDelta();
        if (!institutionsData.some(item => item.aicteId === selectedInstitutionId)) {
          selectedInstitutionId = institutionsData[0]?.aicteId || '';
        }
        if (!casesData.some(item => item.caseId === selectedCaseId)) {
          selectedCaseId = casesData[0]?.caseId || '';
        }
        backendAvailable = true;
        lastSyncedAt = new Date();
        setApiConnectionStatus('online');
      })();
      try {
        return await syncInFlight;
      } catch (error) {
        backendAvailable = false;
        setApiConnectionStatus(lastSyncedAt ? 'stale' : 'offline', getBackendErrorMessage(error));
        throw error;
      } finally {
        syncInFlight = null;
      }
    }

    function recomputeKpiDelta() {
      dashboardMetrics = analyticsData || dashboardMetrics;
    }

    async function refreshAuditEvents() {
      const auditEvents = await apiRequest('/audit-events');
      auditLogsData = auditEvents.map(mapBackendAudit);
    }

    function showBackendUnavailable() {
      showToast('Backend unavailable', 'The API is not connected. This view may contain stale data; start the backend and refresh before making changes.', 'error');
    }

    function getBackendErrorMessage(error) {
      if (!error) return 'The request could not be completed.';
      if (error.kind === 'network' || error.kind === 'timeout') return error.message;
      if (error.kind === 'validation') return `Input validation failed: ${error.message}`;
      if (error.kind === 'not-found') return `The requested API record or endpoint was not found: ${error.message}`;
      if (error.kind === 'server') return `The server could not complete the request. ${error.message}`;
      return error.message || 'The request could not be completed.';
    }

    function getBureauCode(name) {
      return bureausData.find(item => item.name === name)?.code || null;
    }

    // -------------------------------------------------------------------------
    // 5. UTILITY HELPERS & BADGE GENERATORS
    // -------------------------------------------------------------------------
    function getPriorityBadge(priority) {
      const map = {
        'Critical': 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
        'High': 'bg-orange-100 text-orange-800 border-orange-300 font-semibold',
        'Medium': 'bg-amber-100 text-amber-800 border-amber-300 font-medium',
        'Low': 'bg-slate-100 text-slate-700 border-slate-300 font-medium'
      };
      return `<span class="px-2 py-0.5 rounded-full text-[11px] border ${map[priority] || map['Medium']}">${priority}</span>`;
    }

    function getStatusBadge(status) {
      const map = {
        'Submitted': 'bg-slate-100 text-slate-800 border-slate-300',
        'Under Review': 'bg-blue-50 text-blue-800 border-blue-200',
        'In Progress': 'bg-amber-50 text-amber-800 border-amber-300',
        'Awaiting Information': 'bg-purple-50 text-purple-800 border-purple-200',
        'Resolved': 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold',
        'Closed': 'bg-teal-100 text-teal-800 border-teal-300 font-semibold'
      };
      return `<span class="px-2 py-0.5 rounded text-[11px] border ${map[status] || map['Submitted']}">${status}</span>`;
    }

    function getBureauBadge(bureau) {
      const map = {
        'Public Grievance Cell': 'bg-rose-50 text-rose-900 border-rose-200',
        'Approval Bureau': 'bg-blue-50 text-blue-900 border-blue-200',
        'Regulation Bureau': 'bg-amber-50 text-amber-900 border-amber-200',
        'Anti-Ragging Cell': 'bg-purple-50 text-purple-900 border-purple-200',
        'Vigilance / CVC Cell': 'bg-emerald-50 text-emerald-900 border-emerald-200',
        'Finance Bureau': 'bg-cyan-50 text-cyan-900 border-cyan-200'
      };
      return `<span class="px-2 py-0.5 rounded text-[11px] font-medium border ${map[bureau] || 'bg-slate-100 text-slate-800'}">${bureau}</span>`;
    }

    function getCurrentTimestamp() {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      return `2026-10-25 ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    }

    function showToast(title, message, type = 'info') {
      const container = document.getElementById('toastContainer');
      const colors = {
        'success': 'bg-emerald-950 border-emerald-500 text-emerald-100',
        'warning': 'bg-amber-950 border-amber-500 text-amber-100',
        'error': 'bg-rose-950 border-rose-500 text-rose-100',
        'info': 'bg-slate-900 border-amber-500 text-white'
      };
      const icons = {
        'success': 'fa-circle-check text-emerald-400',
        'warning': 'fa-triangle-exclamation text-amber-400',
        'error': 'fa-circle-xmark text-rose-400',
        'info': 'fa-shield-halved text-amber-400'
      };
      const toast = document.createElement('div');
      toast.className = `pointer-events-auto p-3.5 rounded-xl border-l-4 shadow-xl flex items-start gap-3 transition-all duration-300 ${colors[type] || colors.info}`;
      toast.innerHTML = `
        <i class="fa-solid ${icons[type] || icons.info} mt-0.5 text-sm"></i>
        <div class="flex-1 text-xs">
          <div class="font-bold">${title}</div>
          <div class="text-[11px] opacity-90 mt-0.5 leading-snug">${message}</div>
        </div>
      `;
      container.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }, 4200);
    }

    function escapeHtml(value) {
      return String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      })[character]);
    }

    // -------------------------------------------------------------------------
    // 6. NAVIGATION & ROLE SWITCHING LOGIC
    // -------------------------------------------------------------------------
    function renderCurrentScreen() {
      const screenId = currentScreen;
      if (screenId === 'command') renderCommandCenter();
      if (screenId === 'inst360') {
        renderInstitutionList();
        renderInstitutionDossier(selectedInstitutionId);
      }
      if (screenId === 'workbench') {
        renderWorkbenchTable();
        renderCaseInspector(selectedCaseId);
      }
      if (screenId === 'ailinker') renderAiSuggestions();
      if (screenId === 'audit') renderAuditTrail();
      if (screenId === 'analytics') renderAnalyticsScreen();
    }

    function switchScreen(screenId) {
      currentScreen = screenId;
      window.toggleNavigation?.(false);
      const screens = ['command', 'inst360', 'workbench', 'ailinker', 'audit', 'analytics'];
      screens.forEach(s => {
        const el = document.getElementById(`screen-${s}`);
        const nav = document.getElementById(`nav-${s}`);
        if (s === screenId) nav.setAttribute('aria-current', 'page');
        else nav.removeAttribute('aria-current');
        if (s === screenId) {
          el.classList.remove('hidden');
          nav.className = 'nav-btn w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer bg-[#1E3A8A] text-white shadow-sm';
        } else {
          el.classList.add('hidden');
          nav.className = 'nav-btn w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800/80 transition cursor-pointer';
        }
      });

      renderCurrentScreen();
      document.getElementById('mainViewport').scrollTop = 0;
      setApiConnectionStatus('syncing');
      syncBackendData().then(() => {
        if (currentScreen === screenId) renderCurrentScreen();
      }).catch(error => {
        showToast('Screen refresh failed', `Showing the last loaded data, which may be stale. ${getBackendErrorMessage(error)}`, 'warning');
      });
    }

    function handleRoleSwitch(roleValue) {
      currentRole = roleValue;
      const banner = document.getElementById('roleContextBanner');
      const badge = document.getElementById('roleBannerBadge');
      const text = document.getElementById('roleBannerText');

      if (roleValue === 'ALL') {
        banner.classList.add('hidden');
        document.getElementById('cmdFilterBureau').value = 'ALL';
        document.getElementById('wbBureau').value = 'ALL';
      } else {
        banner.classList.remove('hidden');
        badge.textContent = `ROLE: ${roleValue.toUpperCase()}`;
        text.textContent = `Active Role Filter applied for ${roleValue}. Showing primary workload for ${roleValue} while retaining 360° cross-bureau alerts.`;
        document.getElementById('cmdFilterBureau').value = roleValue;
        document.getElementById('wbBureau').value = roleValue;
      }

      renderCommandWatchlist();
      renderWorkbenchTable();
      showToast('Officer Role Switched', `Viewing AICTE NEXUS as: ${roleValue === 'ALL' ? 'All Bureaus (Command View)' : roleValue}`, 'info');
    }

    function resetRoleSwitch() {
      document.getElementById('roleSwitcher').value = 'ALL';
      handleRoleSwitch('ALL');
    }

    function quickFilterBureau(bureauName) {
      document.getElementById('roleSwitcher').value = bureauName;
      handleRoleSwitch(bureauName);
      if (currentScreen !== 'command' && currentScreen !== 'workbench') {
        switchScreen('command');
      }
    }

    // -------------------------------------------------------------------------
    // 7. GLOBAL QUICK SEARCH (CTRL+K)
    // -------------------------------------------------------------------------
    function handleGlobalQuickSearch(query) {
      const dropdown = document.getElementById('globalSearchDropdown');
      const q = (query || '').trim().toLowerCase();
      if (!q) {
        dropdown.classList.add('hidden');
        return;
      }

      const matchedInsts = institutionsData.filter(inst =>
        inst.name.toLowerCase().includes(q) ||
        inst.aicteId.toLowerCase().includes(q) ||
        inst.state.toLowerCase().includes(q)
      );

      const matchedCases = casesData.filter(c =>
        c.caseId.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.institutionName.toLowerCase().includes(q) ||
        c.bureau.toLowerCase().includes(q)
      );

      let html = '';

      if (matchedInsts.length > 0) {
        html += `<div class="px-3 py-1.5 bg-slate-950 text-[10px] font-mono-code uppercase text-amber-400 font-bold">Institutions (360° Dossier)</div>`;
        matchedInsts.slice(0, 4).forEach(inst => {
          html += `
            <div onclick="jumpToInstitution360('${inst.aicteId}')" class="px-3 py-2 hover:bg-slate-800 cursor-pointer border-b border-slate-800 flex items-center justify-between">
              <div>
                <div class="text-xs font-bold text-white">${inst.name}</div>
                <div class="text-[10px] font-mono-code text-slate-400">AICTE PID: ${inst.aicteId} • ${inst.city}, ${inst.state}</div>
              </div>
              <span class="text-[10px] font-mono-code px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">Risk ${inst.riskScore}/100</span>
            </div>
          `;
        });
      }

      if (matchedCases.length > 0) {
        html += `<div class="px-3 py-1.5 bg-slate-950 text-[10px] font-mono-code uppercase text-sky-400 font-bold">Complaint Cases (Workbench)</div>`;
        matchedCases.slice(0, 5).forEach(c => {
          html += `
            <div onclick="jumpToCaseWorkbench('${c.caseId}')" class="px-3 py-2 hover:bg-slate-800 cursor-pointer border-b border-slate-800 flex items-center justify-between gap-2">
              <div class="truncate">
                <div class="text-xs font-bold text-white font-mono-code">${c.caseId} <span class="font-sans font-normal text-slate-300">— ${c.title}</span></div>
                <div class="text-[10px] text-slate-400">${c.institutionName} • ${c.bureau}</div>
              </div>
              <span class="shrink-0 text-[10px] font-mono-code px-1.5 py-0.5 rounded bg-slate-800 text-amber-300">${c.status}</span>
            </div>
          `;
        });
      }

      if (!html) {
        html = `<div class="p-4 text-xs text-slate-400 text-center">No matching Case ID, AICTE PID, or Institution found.</div>`;
      }

      dropdown.innerHTML = html;
      dropdown.classList.remove('hidden');
    }

    // Close search dropdown on outside click or Ctrl+K shortcut
    document.addEventListener('click', (e) => {
      const input = document.getElementById('globalSearchInput');
      const dropdown = document.getElementById('globalSearchDropdown');
      if (input && dropdown && !input.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    });

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const input = document.getElementById('globalSearchInput');
        if (input) input.focus();
      }
    });

    function jumpToInstitution360(aicteId) {
      document.getElementById('globalSearchDropdown').classList.add('hidden');
      selectedInstitutionId = aicteId;
      switchScreen('inst360');
    }

    function jumpToCaseWorkbench(caseId) {
      document.getElementById('globalSearchDropdown').classList.add('hidden');
      selectedCaseId = caseId;
      switchScreen('workbench');
    }

    // -------------------------------------------------------------------------
    // 8. SCREEN 1: COMMAND CENTER RENDERING
    // -------------------------------------------------------------------------
    function updateAllKpiBadges() {
      const total = casesData.length;
      const open = casesData.filter(c => c.status !== 'Resolved' && c.status !== 'Closed').length;
      const resolved = total - open;
      const overdue = casesData.filter(c => c.isOverdue).length;
      const instFlagged = institutionsData.filter(i => i.eoaHold).length;
      const critical = casesData.filter(c => c.priority === 'Critical' || c.priority === 'High').length;
      const activeInstitutions = new Set(casesData.filter(c => c.status !== 'Resolved' && c.status !== 'Closed').map(c => c.aicteId));
      const multibureauInstitutions = institutionsData.filter(inst => new Set(casesData.filter(c => c.aicteId === inst.aicteId).map(c => c.bureauCode)).size > 1).length;
      const maxOverdue = Math.max(0, ...casesData.map(c => c.overdueDays || 0));

      document.getElementById('kpi-total').textContent = total;
      document.getElementById('kpi-open').textContent = open;
      document.getElementById('kpi-resolved').textContent = resolved;
      document.getElementById('kpi-overdue').textContent = overdue;
      document.getElementById('kpi-institutions').textContent = instFlagged;
      document.getElementById('kpi-critical').textContent = critical;
      document.getElementById('kpi-bureau-count').textContent = `${bureausData.length} Bureaus`;
      document.getElementById('kpi-active-pct').textContent = `${total ? (open / total * 100).toFixed(1) : '0.0'}% Active`;
      document.getElementById('kpi-overdue-detail').textContent = `Max delay: ${maxOverdue} days overdue`;
      document.getElementById('kpi-multibureau').textContent = `${multibureauInstitutions} Multi-Bureau`;
      const syncTime = document.getElementById('dashboardSyncTime');
      if (syncTime) syncTime.textContent = `SYNC TIMESTAMP: ${new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'medium' }).format(new Date())} IST`;

      const sideIds = {
        'public-grievance': 'side-count-grievance', approval: 'side-count-approval', regulation: 'side-count-regulation',
        'anti-ragging': 'side-count-antiragging', 'vigilance-cvc': 'side-count-vigilance', finance: 'side-count-finance'
      };
      bureausData.forEach(bureau => {
        const el = document.getElementById(sideIds[bureau.code]);
        if (el) el.textContent = casesData.filter(c => c.bureauCode === bureau.code).length;
      });

      // Update sidebar badges
      document.getElementById('badge-command').textContent = `${overdue} SLA`;
      document.getElementById('badge-inst360').textContent = `${instFlagged} Flagged`;
      document.getElementById('badge-workbench').textContent = `${total} Cases`;

      const pendingAi = aiSuggestionsData.filter(a => a.state === 'Pending Review').length;
      document.getElementById('badge-ailinker').textContent = `${pendingAi} Pending`;
      const cmdAiEl = document.getElementById('cmd-ai-count');
      if (cmdAiEl) cmdAiEl.textContent = pendingAi;

      document.getElementById('badge-audit').textContent = `${auditLogsData.length} Logs`;
    }

    function renderCommandCenter() {
      updateAllKpiBadges();
      renderCommandWatchlist();
      renderBureauMatrix();
      renderCommandRecentAuditFeed();
    }

    function resetCommandFilters() {
      document.getElementById('cmdFilterBureau').value = 'ALL';
      document.getElementById('cmdFilterPriority').value = 'ALL';
      document.getElementById('cmdFilterStatus').value = 'ALL';
      document.getElementById('cmdFilterSearch').value = '';
      if (currentRole !== 'ALL') {
        document.getElementById('roleSwitcher').value = 'ALL';
        handleRoleSwitch('ALL');
      } else {
        renderCommandWatchlist();
      }
    }

    function renderCommandWatchlist() {
      const bureauFilter = document.getElementById('cmdFilterBureau').value;
      const priorityFilter = document.getElementById('cmdFilterPriority').value;
      const statusFilter = document.getElementById('cmdFilterStatus').value;
      const searchQ = (document.getElementById('cmdFilterSearch').value || '').trim().toLowerCase();

      const filtered = casesData.filter(c => {
        if (bureauFilter !== 'ALL' && c.bureau !== bureauFilter) return false;
        if (priorityFilter !== 'ALL' && c.priority !== priorityFilter) return false;
        if (statusFilter === 'OVERDUE_ONLY' && !c.isOverdue) return false;
        if (statusFilter !== 'ALL' && statusFilter !== 'OVERDUE_ONLY' && c.status !== statusFilter) return false;
        if (searchQ) {
          const hay = `${c.caseId} ${c.institutionName} ${c.aicteId} ${c.title} ${c.officer} ${c.bureau}`.toLowerCase();
          if (!hay.includes(searchQ)) return false;
        }
        return true;
      });

      document.getElementById('cmdFilterActiveCount').textContent = `Showing ${filtered.length} of ${casesData.length} persisted complaints`;

      const tbody = document.getElementById('commandWatchlistBody');
      if (filtered.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="8" class="py-8 text-center text-slate-500 text-xs">
              No cases match the current filter combination. Click "Reset Filters" to view all watchlist cases.
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = filtered.map(c => {
        const slaHtml = c.isOverdue && c.status !== 'Resolved' && c.status !== 'Closed'
          ? `<span class="inline-flex items-center gap-1 font-mono-code text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
               <i class="fa-solid fa-triangle-exclamation text-[10px]"></i>${c.overdueDays} d overdue
             </span>`
          : `<span class="font-mono-code text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">Within SLA</span>`;

        const crossLinksCount = c.linkedCases ? c.linkedCases.length : 0;

        return `
          <tr class="hover:bg-blue-50/50 transition group">
            <td class="py-3 px-4 font-mono-code font-bold text-[#1E3A8A] whitespace-nowrap cursor-pointer" onclick="jumpToCaseWorkbench('${c.caseId}')">
              <div class="flex items-center gap-1.5">
                <span>${c.caseId}</span>
                ${crossLinksCount > 0 ? `<span class="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-mono-code" title="${crossLinksCount} Cross-Bureau Linked Case(s)"><i class="fa-solid fa-link mr-0.5"></i>${crossLinksCount}</span>` : ''}
              </div>
              <div class="text-[10px] text-slate-400 font-normal mt-0.5">${c.source}</div>
            </td>
            <td class="py-3 px-4">
              <div onclick="jumpToInstitution360('${c.aicteId}')" class="font-bold text-slate-900 hover:text-[#1E3A8A] hover:underline cursor-pointer flex items-center gap-1">
                <span>${c.institutionName}</span>
                <i class="fa-solid fa-arrow-up-right-from-square text-[9px] text-slate-400"></i>
              </div>
              <div class="text-[11px] text-slate-500 line-clamp-1 mt-0.5">${c.title}</div>
              <div class="text-[10px] font-mono-code text-slate-400">AICTE PID: ${c.aicteId}</div>
            </td>
            <td class="py-3 px-4 whitespace-nowrap">${getBureauBadge(c.bureau)}</td>
            <td class="py-3 px-4 whitespace-nowrap">${getPriorityBadge(c.priority)}</td>
            <td class="py-3 px-4 whitespace-nowrap">${getStatusBadge(c.status)}</td>
            <td class="py-3 px-4 text-slate-700 whitespace-nowrap">
              <div class="font-medium">${c.officer}</div>
              <div class="text-[10px] text-slate-400">${c.category}</div>
            </td>
            <td class="py-3 px-4 whitespace-nowrap">
              <div class="font-mono-code text-[11px] text-slate-700">Due: ${c.dueDate}</div>
              <div class="mt-0.5">${slaHtml}</div>
            </td>
            <td class="py-3 px-4 text-right whitespace-nowrap">
              <div class="flex items-center justify-end gap-1.5">
                <button onclick="jumpToCaseWorkbench('${c.caseId}')" class="px-2.5 py-1 rounded bg-[#1E3A8A] hover:bg-blue-800 text-white text-[11px] font-semibold cursor-pointer">
                  Inspect / Update
                </button>
                <button onclick="jumpToInstitution360('${c.aicteId}')" class="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold cursor-pointer" title="View Institution 360°">
                  360°
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    function renderBureauMatrix() {
      const colors = ['bg-rose-600', 'bg-blue-600', 'bg-amber-500', 'bg-purple-600', 'bg-emerald-600', 'bg-cyan-600'];
      const bureauStats = bureausData.map((bureau, index) => {
        const rows = casesData.filter(c => c.bureau === bureau.name);
        const openRows = rows.filter(c => c.status !== 'Resolved' && c.status !== 'Closed');
        return { name: bureau.name, total: rows.length, open: openRows.length,
          overdue: openRows.filter(c => c.isOverdue).length, resolved: rows.length - openRows.length,
          color: colors[index % colors.length] };
      });

      const container = document.getElementById('bureauMatrixContainer');
      const activeTotal = bureauStats.reduce((sum, item) => sum + item.open, 0);
      const overdueTotal = bureauStats.reduce((sum, item) => sum + item.overdue, 0);
      document.getElementById('bureauMatrixSummary').textContent =
        `Persisted records: ${casesData.length} total, ${activeTotal} open, ${overdueTotal} overdue across ${bureausData.length} bureaus.`;
      container.innerHTML = bureauStats.map(b => {
        const openPct = b.total ? Math.round((b.open / b.total) * 100) : 0;
        const overduePct = b.total ? Math.round((b.overdue / b.total) * 100) : 0;
        return `
          <div onclick="quickFilterBureau('${b.name}')" class="p-3 rounded-lg border border-slate-200 hover:border-blue-300 bg-slate-50/60 hover:bg-blue-50/30 transition cursor-pointer">
            <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div class="font-bold text-slate-900 flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full ${b.color}"></span>
                <span>${b.name}</span>
              </div>
              <div class="flex items-center gap-3 font-mono-code text-[11px]">
                <span class="text-slate-700">Total: <strong>${b.total}</strong></span>
                <span class="text-amber-700">Open: <strong>${b.open}</strong></span>
                <span class="text-rose-700 font-bold">Overdue: ${b.overdue}</span>
                <span class="text-emerald-700">Resolved: <strong>${b.resolved}</strong></span>
              </div>
            </div>
            <div class="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-2 flex">
              <div class="bg-rose-600 h-full" style="width: ${overduePct}%" title="Overdue SLA (${b.overdue})"></div>
              <div class="bg-amber-500 h-full" style="width: ${openPct - overduePct}%" title="Active Within SLA"></div>
              <div class="bg-emerald-500 h-full flex-1" title="Resolved (${b.resolved})"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    function renderCommandRecentAuditFeed() {
      const container = document.getElementById('commandRecentAuditFeed');
      container.innerHTML = auditLogsData.slice(0, 5).map(log => `
        <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
          <div class="flex items-center justify-between">
            <span class="font-mono-code text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-[#1E3A8A]">${log.actionType}</span>
            <span class="font-mono-code text-[10px] text-slate-400">${log.timestamp.split(' ')[1]} IST</span>
          </div>
          <div class="font-semibold text-slate-800 font-mono-code text-[11px]">${log.entityId} <span class="font-sans font-normal text-slate-500">by ${log.actor}</span></div>
          <p class="text-[11px] text-slate-600 line-clamp-2">${log.diff}</p>
        </div>
      `).join('');
    }

    // -------------------------------------------------------------------------
    // 9. SCREEN 2: INSTITUTION 360° DIRECTORY & DOSSIER VIEW
    // -------------------------------------------------------------------------
    function renderInstitutionList() {
      const q = (document.getElementById('instSearchInput')?.value || '').trim().toLowerCase();
      const listEl = document.getElementById('instDirectoryList');
      const count = document.getElementById('instDirectoryCount');
      if (count) count.textContent = `${institutionsData.filter(inst => inst.eoaHold).length} EoA Holds / ${institutionsData.filter(inst => inst.riskScore >= 80).length} High Risk`;

      const filtered = institutionsData.filter(inst =>
        !q ||
        inst.name.toLowerCase().includes(q) ||
        inst.aicteId.toLowerCase().includes(q) ||
        inst.state.toLowerCase().includes(q) ||
        inst.city.toLowerCase().includes(q)
      );

      listEl.innerHTML = filtered.map(inst => {
        const instCases = casesData.filter(c => c.aicteId === inst.aicteId);
        const bureausSet = new Set(instCases.map(c => c.bureau));
        const isSelected = inst.aicteId === selectedInstitutionId;
        const riskColor = inst.riskScore >= 85
          ? 'bg-rose-100 text-rose-800 border-rose-300'
          : inst.riskScore >= 75
          ? 'bg-amber-100 text-amber-800 border-amber-300'
          : 'bg-blue-100 text-blue-800 border-blue-300';

        return `
          <div
            onclick="selectInstitution360('${inst.aicteId}')"
            class="p-3.5 cursor-pointer transition border-l-4 ${isSelected ? 'bg-blue-50/80 border-l-[#1E3A8A]' : 'hover:bg-slate-50 border-l-transparent'}"
          >
            <div class="flex items-start justify-between gap-2">
              <div>
                <div class="text-xs font-bold text-slate-900">${inst.name}</div>
                <div class="text-[11px] font-mono-code text-slate-500 mt-0.5">PID: ${inst.aicteId} • ${inst.city}, ${inst.state}</div>
              </div>
              <span class="px-2 py-0.5 rounded text-[10px] font-mono-code font-bold border shrink-0 ${riskColor}">
                Risk ${inst.riskScore}/100
              </span>
            </div>
            <div class="mt-2 flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-1.5 text-[11px]">
                <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono-code font-semibold">${instCases.length} Cases</span>
                <span class="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 font-mono-code font-semibold">${bureausSet.size} Bureaus</span>
              </div>
              ${inst.eoaHold
                ? `<span class="text-[10px] font-mono-code font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded"><i class="fa-solid fa-lock mr-1"></i>EoA HOLD</span>`
                : `<span class="text-[10px] font-mono-code text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">EoA Monitored</span>`
              }
            </div>
          </div>
        `;
      }).join('');
    }

    function selectInstitution360(aicteId) {
      selectedInstitutionId = aicteId;
      renderInstitutionList();
      renderInstitutionDossier(aicteId);
    }

    async function toggleInstitutionEoaHold(aicteId) {
      const inst = institutionsData.find(i => i.aicteId === aicteId);
      if (!inst) return;
      if (!backendAvailable) return showBackendUnavailable();
      const actionKey = `institution:${aicteId}`;
      if (pendingApiActions.has(actionKey)) return;
      pendingApiActions.add(actionKey);
      const eoaHold = !inst.eoaHold;
      const eoaStatus = eoaHold ? 'EoA 2026-27 Under Hold' : 'Conditional EoA Active';
      try {
        const saved = await apiRequest(`/institutions/${encodeURIComponent(aicteId)}`, {
          method: 'PATCH',
          body: JSON.stringify({
            eoa_hold: eoaHold,
            eoa_status: eoaStatus,
            actor: currentRole === 'ALL' ? 'Chairman Command Desk' : currentRole
          })
        });
        Object.assign(inst, mapBackendInstitution(saved));
      } catch (error) {
        showToast('Institution update failed', getBackendErrorMessage(error), 'error');
        pendingApiActions.delete(actionKey);
        return;
      }
      let refreshed = true;
      try {
        await syncBackendData();
      } catch (error) {
        refreshed = false;
        showToast('Saved, but view refresh failed', 'The institution change was saved; reload to refresh analytics and audit views.', 'warning');
      }

      updateAllKpiBadges();
      renderInstitutionList();
      renderInstitutionDossier(aicteId);
      renderCommandCenter();
      renderAnalyticsScreen();
      renderAuditTrail();
      showToast(
        refreshed ? (inst.eoaHold ? 'EoA Approval Placed on Hold' : 'EoA Hold Released') : 'Institution saved; data may be stale',
        refreshed ? `${inst.name} (${inst.aicteId}) status was saved and added to the audit event history.` : 'The database accepted the change. Reconnect to refresh analytics and audit entries.',
        refreshed ? (inst.eoaHold ? 'warning' : 'success') : 'warning'
      );
      pendingApiActions.delete(actionKey);
    }

    function renderInstitutionDossier(aicteId) {
      const inst = institutionsData.find(i => i.aicteId === aicteId) || institutionsData[0];
      const container = document.getElementById('instDossierContainer');
      if (!inst) {
        container.innerHTML = '<div class="bg-white rounded-xl border border-slate-200 p-6 text-center text-sm text-slate-500">No institution data is available. Connect to the API to load persisted records.</div>';
        return;
      }
      const instCases = casesData.filter(c => c.aicteId === inst.aicteId);

      // Count per bureau
      const allBureaus = bureausData.length
        ? bureausData.map(item => item.name)
        : [
          'Approval Bureau',
          'Public Grievance Cell',
          'Regulation Bureau',
          'Anti-Ragging Cell',
          'Vigilance / CVC Cell',
          'Finance Bureau'
        ];
      const bureauCounts = {};
      allBureaus.forEach(b => bureauCounts[b] = 0);
      instCases.forEach(c => {
        bureauCounts[c.bureau] = (bureauCounts[c.bureau] || 0) + 1;
      });

      container.innerHTML = `
        <!-- Institution Header Card -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="bg-slate-900 text-white p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <span class="font-mono-code text-xs px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                  AICTE PID: ${inst.aicteId}
                </span>
                <span class="font-mono-code text-xs px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  ${inst.region}
                </span>
                <span class="font-mono-code text-xs px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Sanctioned Intake: ${inst.intake}
                </span>
              </div>
              <h3 class="text-lg sm:text-xl font-bold text-white mt-2">${inst.name}</h3>
              <p class="text-xs text-slate-300 mt-0.5">${inst.city}, ${inst.state} • ${inst.type}</p>
            </div>

            <!-- Composite Risk Score Box -->
            <div class="flex items-center gap-3 bg-slate-800/90 border border-slate-700 p-3 rounded-xl shrink-0">
              <div class="text-right">
                <div class="text-[10px] font-mono-code uppercase text-slate-400">Composite Risk Index</div>
                <div class="text-2xl font-extrabold font-mono-code ${inst.riskScore >= 85 ? 'text-rose-400' : 'text-amber-400'}">${inst.riskScore}<span class="text-xs text-slate-400">/100</span></div>
                <div class="text-[10px] font-semibold text-rose-300">HIGH MULTI-BUREAU RISK</div>
              </div>
              <div class="w-11 h-11 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 text-lg">
                <i class="fa-solid fa-shield-virus"></i>
              </div>
            </div>
          </div>

          <!-- Active Cross-Bureau Hold Alert Banner -->
          <div class="p-4 ${inst.eoaHold ? 'bg-rose-50 border-b border-rose-200' : 'bg-emerald-50 border-b border-emerald-200'} flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-start gap-3">
              <span class="w-8 h-8 rounded-lg ${inst.eoaHold ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'} flex items-center justify-center shrink-0 mt-0.5">
                <i class="fa-solid ${inst.eoaHold ? 'fa-ban' : 'fa-check'}"></i>
              </span>
              <div>
                <div class="text-xs font-bold ${inst.eoaHold ? 'text-rose-950' : 'text-emerald-950'} uppercase tracking-wide">
                  ${inst.eoaStatus} — ${inst.holdReason}
                </div>
                <p class="text-xs ${inst.eoaHold ? 'text-rose-800' : 'text-emerald-800'} mt-0.5">
                  ${inst.summary}
                </p>
              </div>
            </div>
            <button
              onclick="toggleInstitutionEoaHold('${inst.aicteId}')"
              class="px-3 py-2 rounded-lg text-xs font-bold shrink-0 cursor-pointer transition ${inst.eoaHold ? 'bg-slate-900 hover:bg-slate-800 text-white' : 'bg-rose-700 hover:bg-rose-800 text-white'}"
            >
              <i class="fa-solid ${inst.eoaHold ? 'fa-unlock' : 'fa-lock'} mr-1"></i>
              ${inst.eoaHold ? 'Override / Release EoA Hold' : 'Place EoA Approval on Hold'}
            </button>
          </div>

          <!-- Bureaus Involved Summary Strip -->
          <div class="p-4 bg-slate-50 border-b border-slate-200">
            <div class="text-[11px] font-mono-code uppercase text-slate-500 font-bold mb-2.5">
              Bureaus Involved Summary Strip (Single-Institution Inter-Bureau Footprint)
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              ${allBureaus.map(b => {
                const count = bureauCounts[b] || 0;
                return `
                  <div class="p-2.5 rounded-lg border ${count > 0 ? 'bg-white border-blue-300 shadow-2xs' : 'bg-slate-100/70 border-slate-200 opacity-60'}">
                    <div class="text-[10px] font-semibold text-slate-600 truncate">${b}</div>
                    <div class="mt-1 flex items-baseline justify-between">
                      <span class="font-mono-code text-lg font-extrabold ${count > 0 ? 'text-[#1E3A8A]' : 'text-slate-400'}">${count}</span>
                      <span class="text-[10px] font-mono-code ${count > 0 ? 'text-rose-600 font-semibold' : 'text-slate-400'}">${count > 0 ? 'ACTIVE' : 'Clear'}</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Unified Cross-Bureau Timeline & Case Table for this Institution -->
          <div class="p-4 space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-sm font-bold text-slate-900">Unified Cross-Bureau Complaint Timeline (${instCases.length} Cases)</h4>
                <p class="text-xs text-slate-500">Chronological view across all AICTE Bureaus so officers immediately see concurrent investigations</p>
              </div>
              <button onclick="openIngestModalForInst('${inst.aicteId}')" class="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 border border-amber-300 text-xs font-semibold cursor-pointer">
                + Log Case for this Institution
              </button>
            </div>

            <div class="overflow-x-auto border border-slate-200 rounded-xl">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                    <th class="py-2.5 px-3">Case ID & Filed</th>
                    <th class="py-2.5 px-3">AICTE Bureau</th>
                    <th class="py-2.5 px-3">Violation & Complaint Summary</th>
                    <th class="py-2.5 px-3">Priority & Status</th>
                    <th class="py-2.5 px-3">SLA & Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 text-xs">
                  ${instCases.map(c => `
                    <tr class="hover:bg-blue-50/40">
                      <td class="py-3 px-3 font-mono-code font-bold text-[#1E3A8A] whitespace-nowrap">
                        <div>${c.caseId}</div>
                        <div class="text-[10px] text-slate-400 font-normal">Filed: ${c.filedDate}</div>
                      </td>
                      <td class="py-3 px-3 whitespace-nowrap">${getBureauBadge(c.bureau)}</td>
                      <td class="py-3 px-3">
                        <div class="font-semibold text-slate-900">${c.category}</div>
                        <div class="text-slate-600 text-[11px] mt-0.5">${c.title}</div>
                        <div class="text-[11px] text-slate-500 italic mt-1 bg-slate-50 p-1.5 rounded border border-slate-200">
                          <strong>Latest Note:</strong> ${c.resolutionNotes}
                        </div>
                      </td>
                      <td class="py-3 px-3 whitespace-nowrap space-y-1">
                        <div>${getPriorityBadge(c.priority)}</div>
                        <div>${getStatusBadge(c.status)}</div>
                      </td>
                      <td class="py-3 px-3 whitespace-nowrap">
                        <div class="font-mono-code text-[11px] ${c.isOverdue && c.status !== 'Resolved' && c.status !== 'Closed' ? 'text-rose-700 font-bold' : 'text-emerald-700'}">
                          ${c.isOverdue && c.status !== 'Resolved' && c.status !== 'Closed' ? `${c.overdueDays}d Overdue` : 'Within SLA'}
                        </div>
                        <button onclick="jumpToCaseWorkbench('${c.caseId}')" class="mt-1.5 px-2.5 py-1 rounded bg-[#1E3A8A] text-white text-[11px] font-semibold hover:bg-blue-800 cursor-pointer">
                          Open in Workbench →
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    }

    // -------------------------------------------------------------------------
    // 10. SCREEN 3: COMPLAINT CASE MANAGEMENT & RESOLUTION WORKBENCH
    // -------------------------------------------------------------------------
    function renderWorkbenchTable() {
      const q = (document.getElementById('wbSearch')?.value || '').trim().toLowerCase();
      const bureau = document.getElementById('wbBureau')?.value || 'ALL';
      const status = document.getElementById('wbStatus')?.value || 'ALL';
      const priority = document.getElementById('wbPriority')?.value || 'ALL';
      const source = document.getElementById('wbSource')?.value || 'ALL';

      const filtered = casesData.filter(c => {
        if (bureau !== 'ALL' && c.bureau !== bureau) return false;
        if (status !== 'ALL' && c.status !== status) return false;
        if (priority !== 'ALL' && c.priority !== priority) return false;
        if (source !== 'ALL' && c.source !== source) return false;
        if (q) {
          const hay = `${c.caseId} ${c.institutionName} ${c.aicteId} ${c.title} ${c.category} ${c.officer}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });

      document.getElementById('wbTableCount').textContent = `${filtered.length} Cases Displayed`;

      const tbody = document.getElementById('workbenchTableBody');
      tbody.innerHTML = filtered.map(c => {
        const isSelected = c.caseId === selectedCaseId;
        return `
          <tr
            onclick="selectCaseInWorkbench('${c.caseId}')"
            class="cursor-pointer transition border-l-4 ${isSelected ? 'bg-blue-50/90 border-l-[#1E3A8A]' : 'hover:bg-slate-50 border-l-transparent'}"
          >
            <td class="py-3 px-3 whitespace-nowrap">
              <div class="font-mono-code font-bold text-[#1E3A8A]">${c.caseId}</div>
              <div class="text-[10px] font-mono-code ${c.isOverdue && c.status !== 'Resolved' && c.status !== 'Closed' ? 'text-rose-600 font-bold' : 'text-slate-400'}">
                ${c.isOverdue && c.status !== 'Resolved' && c.status !== 'Closed' ? `${c.overdueDays}d overdue` : `Due ${c.dueDate}`}
              </div>
            </td>
            <td class="py-3 px-3">
              <div class="font-bold text-slate-900">${c.institutionName}</div>
              <div class="text-[11px] text-slate-600 line-clamp-1">${c.title}</div>
              <div class="text-[10px] font-mono-code text-slate-400">PID: ${c.aicteId} • ${c.source}</div>
            </td>
            <td class="py-3 px-3 whitespace-nowrap">${getBureauBadge(c.bureau)}</td>
            <td class="py-3 px-3 whitespace-nowrap space-y-1">
              <div>${getPriorityBadge(c.priority)}</div>
              <div>${getStatusBadge(c.status)}</div>
            </td>
          </tr>
        `;
      }).join('');
    }

    function selectCaseInWorkbench(caseId) {
      selectedCaseId = caseId;
      renderWorkbenchTable();
      renderCaseInspector(caseId);
    }

    function renderCaseInspector(caseId) {
      if (workflowDraft?.dirty && workflowDraft.caseId === caseId) return;
      if (workflowDraft?.caseId !== caseId) workflowDraft = null;
      const c = casesData.find(item => item.caseId === caseId) || casesData[0];
      const panel = document.getElementById('caseInspectorPanel');
      if (!c) {
        panel.innerHTML = `
          <div class="p-6 text-center text-sm text-slate-500">
            No complaints are available from the API. Run the documented demo seed command or register a complaint.
          </div>
        `;
        return;
      }
      const siblingCases = casesData.filter(item => item.aicteId === c.aicteId && item.caseId !== c.caseId);
      const confirmedRelations = backendCaseLinks.filter(link =>
        ['Confirmed Link', 'Merged Duplicate'].includes(link.state) &&
        (link.source_case_id === c.caseId || link.target_case_id === c.caseId)
      );
      panel.innerHTML = `
        <!-- Inspector Top Header -->
        <div class="bg-[#0F172A] text-white p-4 flex items-center justify-between">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-mono-code text-sm font-bold text-amber-400">${c.caseId}</span>
              ${getPriorityBadge(c.priority)}
              ${getStatusBadge(c.status)}
            </div>
            <div class="text-xs text-slate-300 mt-1 font-medium">${c.institutionName} (<span class="font-mono-code">${c.aicteId}</span>)</div>
          </div>
          <button
            onclick="jumpToInstitution360('${c.aicteId}')"
            class="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-[11px] font-mono-code font-semibold cursor-pointer shrink-0"
          >
            Open 360° Dossier →
          </button>
        </div>

        <div class="p-4 space-y-4 overflow-y-auto flex-1">
          <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1.5">
            <div class="text-[10px] font-mono-code uppercase text-emerald-900 font-bold">Confirmed Case Relationships (${confirmedRelations.length})</div>
            ${confirmedRelations.length ? `<ul class="space-y-1">${confirmedRelations.map(link => {
              const partnerId = link.source_case_id === c.caseId ? link.target_case_id : link.source_case_id;
              const partner = casesData.find(item => item.caseId === partnerId);
              return `<li class="text-emerald-950">${escapeHtml(link.state === 'Merged Duplicate' ? 'Marked duplicate (records retained)' : 'Confirmed link')}: <button type="button" onclick="selectCaseInWorkbench('${escapeHtml(partnerId)}')" class="font-mono-code font-bold underline">${escapeHtml(partnerId)}</button>${partner ? ` · ${escapeHtml(partner.bureau)}` : ''}</li>`;
            }).join('')}</ul>` : '<p class="text-slate-600">No confirmed relationship has been recorded. Suggestions remain separate until an officer confirms them.</p>'}
          </div>

          <!-- Same-institution context; this is not the same as a confirmed case link. -->
          ${siblingCases.length > 0 ? `
            <div class="p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs space-y-1.5">
              <div class="font-bold text-amber-950 flex items-center gap-1.5">
                <i class="fa-solid fa-triangle-exclamation text-amber-600"></i>
                <span>OTHER CASES AT SAME INSTITUTION (NOT NECESSARILY LINKED): ${siblingCases.length}</span>
              </div>
              <div class="space-y-1">
                ${siblingCases.map(sib => `
                  <div onclick="selectCaseInWorkbench('${sib.caseId}')" class="p-1.5 rounded bg-white/90 border border-amber-200 flex items-center justify-between cursor-pointer hover:bg-amber-100/50">
                    <span class="font-mono-code font-bold text-[#1E3A8A] text-[11px]">${sib.caseId} <span class="font-sans font-semibold text-slate-700">(${sib.bureau})</span></span>
                    <span class="text-[10px] font-mono-code px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">${sib.status}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Full Complaint Metadata Grid -->
          <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div class="font-bold text-slate-900 text-sm">${c.title}</div>
            <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-[11px]">
              <div><span class="text-slate-500">Assigned Bureau:</span> <strong class="text-slate-800">${c.bureau}</strong></div>
              <div><span class="text-slate-500">Ingestion Source:</span> <strong class="font-mono-code text-slate-800">${c.source}</strong></div>
              <div><span class="text-slate-500">Complainant:</span> <strong class="text-slate-800">${c.complainant}</strong></div>
              <div><span class="text-slate-500">Violation Category:</span> <strong class="text-slate-800">${c.category}</strong></div>
              <div><span class="text-slate-500">Filed Date:</span> <strong class="font-mono-code text-slate-800">${c.filedDate}</strong></div>
              <div><span class="text-slate-500">SLA Target Date:</span> <strong class="font-mono-code ${c.isOverdue ? 'text-rose-700' : 'text-emerald-700'}">${c.dueDate} (${c.isOverdue ? c.overdueDays + 'd Overdue' : 'Active'})</strong></div>
            </div>
          </div>

          <!-- Current Verification / Investigation Notes -->
          <div class="p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-xs">
            <div class="text-[10px] font-mono-code uppercase text-[#1E3A8A] font-bold">Latest Recorded Investigation / Resolution Note</div>
            <p class="text-slate-800 mt-1">${c.resolutionNotes || 'No officer notes recorded yet.'}</p>
          </div>

          <div id="caseWorkflowHistory" data-case-id="${c.caseId}" class="p-3 rounded-xl bg-white border border-slate-200 text-xs">
            <div class="text-[10px] font-mono-code uppercase text-slate-700 font-bold">Persisted Workflow History</div>
            <p class="text-slate-500 mt-1">Loading workflow events…</p>
          </div>

          <!-- INTERACTIVE STATUS & OFFICER UPDATE WORKFLOW FORM -->
          <form oninput="markWorkflowDraft('${c.caseId}')" onsubmit="handleCaseWorkflowUpdate(event, '${c.caseId}')" class="space-y-3 pt-2 border-t border-slate-200">
            <div class="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span>Officer Workflow & Status Transition</span>
              <span class="text-[10px] font-mono-code text-emerald-700">Audit Trail Enabled</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="sm:col-span-2">
                <label class="block text-[11px] font-semibold text-slate-600 mb-1">Complaint Title</label>
                <input id="inspectorTitleInput" type="text" maxlength="500" required value="${c.title}" class="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-2" />
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-slate-600 mb-1">Violation Category</label>
                <input id="inspectorCategoryInput" type="text" maxlength="120" required value="${c.category}" class="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-2" />
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-slate-600 mb-1">Priority</label>
                <select id="inspectorPrioritySelect" class="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-2">
                  ${['Critical', 'High', 'Medium', 'Low'].map(value => `<option value="${value}" ${c.priority === value ? 'selected' : ''}>${value}</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-semibold text-slate-600 mb-1">Update Workflow Status</label>
                <select id="inspectorStatusSelect" onchange="checkMandatoryResolutionRule()" class="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-2 font-semibold">
                  <option value="Submitted" ${c.status === 'Submitted' ? 'selected' : ''}>Submitted</option>
                  <option value="Under Review" ${c.status === 'Under Review' ? 'selected' : ''}>Under Review</option>
                  <option value="In Progress" ${c.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                  <option value="Awaiting Information" ${c.status === 'Awaiting Information' ? 'selected' : ''}>Awaiting Information</option>
                  <option value="Resolved" ${c.status === 'Resolved' ? 'selected' : ''}>Resolved (Requires Note)</option>
                  <option value="Closed" ${c.status === 'Closed' ? 'selected' : ''}>Closed (Requires Note)</option>
                </select>
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-slate-600 mb-1">Assigned Nodal Officer</label>
                <input
                  id="inspectorOfficerInput"
                  type="text"
                  value="${c.officer}"
                  class="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-2"
                />
              </div>
            </div>

            <div>
              <label class="block text-[11px] font-semibold text-slate-600 mb-1">Cross-Bureau Escalation / Reassign Bureau (Optional)</label>
              <select id="inspectorBureauSelect" class="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-2">
                <option value="${c.bureau}">Keep in ${c.bureau}</option>
                <option value="Public Grievance Cell">Escalate / Transfer → Public Grievance Cell</option>
                <option value="Approval Bureau">Escalate / Transfer → Approval Bureau</option>
                <option value="Regulation Bureau">Escalate / Transfer → Regulation Bureau</option>
                <option value="Anti-Ragging Cell">Escalate / Transfer → Anti-Ragging Cell</option>
                <option value="Vigilance / CVC Cell">Escalate / Transfer → Vigilance / CVC Cell</option>
                <option value="Finance Bureau">Escalate / Transfer → Finance Bureau</option>
              </select>
            </div>

            <div>
              <label class="block text-[11px] font-semibold text-slate-600 mb-1">
                Official Investigation / Resolution Verification Notes <span id="mandatoryStar" class="text-rose-600 font-bold hidden">* MANDATORY FOR RESOLVED/CLOSED</span>
              </label>
              <textarea
                id="inspectorNotesInput"
                rows="3"
                placeholder="Enter official inspection findings, UTR/affidavit reference, or resolution justification (Mandatory when marking Resolved or Closed)..."
                class="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#1E3A8A]"
              ></textarea>
              <!-- Inline Validation Warning -->
              <div id="resolutionValidationAlert" class="hidden mt-1.5 p-2.5 rounded-lg bg-rose-50 border border-rose-300 text-[11px] text-rose-800 flex items-start gap-2">
                <i class="fa-solid fa-circle-exclamation text-rose-600 mt-0.5"></i>
                <span><strong>AICTE Governance Policy Violation:</strong> You cannot transition a complaint to <code>Resolved</code> or <code>Closed</code> without entering official verification / resolution notes (minimum 15 characters).</span>
              </div>
            </div>

            <button
              type="submit"
              class="w-full py-2.5 px-4 rounded-lg bg-[#1E3A8A] hover:bg-blue-800 text-white text-xs font-bold shadow flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <i class="fa-solid fa-file-signature"></i>
              <span>Save Workflow Update & Record Audit Event</span>
            </button>
          </form>
        </div>
      `;
      loadCaseWorkflowHistory(c.caseId);
    }

    function markWorkflowDraft(caseId) {
      workflowDraft = { caseId, dirty: true };
    }

    async function loadCaseWorkflowHistory(caseId) {
      const requestId = ++workflowHistoryRequest;
      const panel = document.getElementById('caseWorkflowHistory');
      if (!panel || panel.dataset.caseId !== caseId) return;
      try {
        const events = await apiRequest(`/complaints/${encodeURIComponent(caseId)}/workflow-events`);
        const activePanel = document.getElementById('caseWorkflowHistory');
        if (requestId !== workflowHistoryRequest || !activePanel || activePanel.dataset.caseId !== caseId) return;
        activePanel.innerHTML = `
          <div class="text-[10px] font-mono-code uppercase text-slate-700 font-bold">Persisted Workflow History (${events.length})</div>
          ${events.length ? `<ol class="mt-2 space-y-2">${events.map(event => {
            const when = new Date(event.occurred_at);
            const timestamp = Number.isNaN(when.getTime()) ? event.occurred_at : new Intl.DateTimeFormat('en-IN', {
              timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short'
            }).format(when);
            const transition = [event.from_status, event.to_status].filter(Boolean).join(' → ');
            const bureau = event.to_bureau_code ? bureausData.find(item => item.code === event.to_bureau_code)?.name : '';
            return `<li class="border-l-2 border-blue-200 pl-2.5">
              <div class="flex flex-wrap justify-between gap-1"><strong class="text-slate-800">${escapeHtml(event.event_type)}${transition ? ` · ${escapeHtml(transition)}` : ''}</strong><time class="text-[10px] text-slate-500">${escapeHtml(timestamp)}</time></div>
              <div class="text-[10px] text-slate-500">${escapeHtml(event.actor || 'System')}${event.assigned_officer ? ` · Assigned: ${escapeHtml(event.assigned_officer)}` : ''}${bureau ? ` · ${escapeHtml(bureau)}` : ''}</div>
              ${event.note ? `<p class="mt-1 text-slate-700">${escapeHtml(event.note)}</p>` : ''}
            </li>`;
          }).join('')}</ol>` : '<p class="text-slate-500 mt-1">No workflow events are recorded.</p>'}
        `;
      } catch (error) {
        const activePanel = document.getElementById('caseWorkflowHistory');
        if (requestId !== workflowHistoryRequest || !activePanel || activePanel.dataset.caseId !== caseId) return;
        activePanel.innerHTML = `<div class="text-[10px] font-mono-code uppercase text-slate-700 font-bold">Persisted Workflow History</div><p class="text-rose-700 mt-1">Could not load workflow history: ${escapeHtml(getBackendErrorMessage(error))}</p>`;
      }
    }

    function checkMandatoryResolutionRule() {
      const status = document.getElementById('inspectorStatusSelect')?.value;
      const star = document.getElementById('mandatoryStar');
      const alertBox = document.getElementById('resolutionValidationAlert');
      if (status === 'Resolved' || status === 'Closed') {
        star?.classList.remove('hidden');
      } else {
        star?.classList.add('hidden');
        alertBox?.classList.add('hidden');
      }
    }

    async function handleCaseWorkflowUpdate(e, caseId) {
      e.preventDefault();
      const c = casesData.find(item => item.caseId === caseId);
      if (!c) return;
      if (!backendAvailable) return showBackendUnavailable();

      const newStatus = document.getElementById('inspectorStatusSelect').value;
      const newOfficer = document.getElementById('inspectorOfficerInput').value.trim() || c.officer;
      const newBureau = document.getElementById('inspectorBureauSelect').value;
      const newNote = document.getElementById('inspectorNotesInput').value.trim();
      const newTitle = document.getElementById('inspectorTitleInput').value.trim();
      const newCategory = document.getElementById('inspectorCategoryInput').value.trim();
      const newPriority = document.getElementById('inspectorPrioritySelect').value;
      const alertBox = document.getElementById('resolutionValidationAlert');

      // Enforce mandatory resolution notes when Resolved or Closed is chosen
      if ((newStatus === 'Resolved' || newStatus === 'Closed') && newNote.length < 15) {
        alertBox.classList.remove('hidden');
        showToast('Validation Blocked', 'Resolution/Closure requires a verified official note (min 15 characters).', 'error');
        return;
      }
      alertBox.classList.add('hidden');
      const bureauCode = getBureauCode(newBureau);
      if (!bureauCode) {
        showToast('Workflow update failed', `The bureau "${newBureau}" is not available from the API.`, 'error');
        return;
      }
      const actionKey = `workflow:${caseId}`;
      if (pendingApiActions.has(actionKey)) return;
      pendingApiActions.add(actionKey);
      const submitButton = e.submitter || e.currentTarget.querySelector('button[type="submit"]');
      if (submitButton) submitButton.disabled = true;
      showToast('Saving workflow update', 'Sending the status, assignment, bureau, and note to the API.', 'info');
      let saved;
      try {
        saved = await apiRequest(`/complaints/${encodeURIComponent(caseId)}`, {
          method: 'PATCH',
          body: JSON.stringify({
            status: newStatus,
            assigned_officer: newOfficer,
            bureau_code: bureauCode,
            title: newTitle,
            category: newCategory,
            priority: newPriority,
            resolution_note: newNote || null,
            actor: currentRole === 'ALL' ? newOfficer : currentRole
          })
        });
      } catch (error) {
        if (submitButton) submitButton.disabled = false;
        pendingApiActions.delete(actionKey);
        showToast('Workflow update failed', getBackendErrorMessage(error), 'error');
        return;
      }
      Object.assign(c, mapBackendComplaint(saved));
      workflowDraft = null;
      let refreshed = true;
      try {
        await syncBackendData();
      } catch (error) {
        refreshed = false;
        showToast('Saved, but view refresh failed', 'The update was saved; reload to refresh analytics, suggestions, and audit views.', 'warning');
      }
      if (submitButton) submitButton.disabled = false;
      pendingApiActions.delete(actionKey);

      updateAllKpiBadges();
      renderWorkbenchTable();
      renderCaseInspector(caseId);
      renderCommandCenter();
      renderAnalyticsScreen();
      renderAuditTrail();
      if (refreshed) {
        showToast(`Case ${c.caseId} Updated`, `Transitioned to ${newStatus}; the workflow event and audit event were saved.`, 'success');
      } else {
        showToast(`Case ${c.caseId} saved; data may be stale`, 'The database accepted the update. Reconnect to refresh workflow history, audit entries, and analytics.', 'warning');
      }
    }

    // -------------------------------------------------------------------------
    // 11. SCREEN 4: AI CROSS-BUREAU CASE LINKER & DUPLICATE DETECTION
    // -------------------------------------------------------------------------
    function renderAiSuggestions() {
      const filterState = document.getElementById('aiFilterState')?.value || 'ALL';
      const container = document.getElementById('aiSuggestionsContainer');

      const filtered = aiSuggestionsData.filter(item =>
        filterState === 'ALL' || item.state === filterState
      );

      container.innerHTML = filtered.map(item => {
        const stateBadge = item.state === 'Pending Review'
          ? 'bg-amber-100 text-amber-900 border-amber-300'
          : item.state === 'Confirmed Link'
          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
          : item.state === 'Merged Duplicate'
          ? 'bg-purple-100 text-purple-900 border-purple-300'
          : 'bg-slate-200 text-slate-600 border-slate-300';

        const typeBadge = item.relationshipType === 'Duplicate'
          ? 'bg-rose-100 text-rose-800 border-rose-200'
          : item.relationshipType === 'Cross-Bureau Causal Link'
          ? 'bg-indigo-100 text-indigo-900 border-indigo-200'
          : 'bg-purple-100 text-purple-900 border-purple-200';
        const sourceLabel = item.state === 'Confirmed Link'
          ? 'CONFIRMED CASE LINK'
          : item.state === 'Merged Duplicate'
          ? 'MARKED DUPLICATE · RECORDS RETAINED'
          : item.state === 'Dismissed'
          ? 'DISMISSED CANDIDATE'
          : item.match_source === 'synthetic_demo_scenario'
          ? 'SYNTHETIC DEMO CANDIDATE'
          : `${item.similarity}% RULE-BASED CANDIDATE`;

        return `
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              <!-- Card Header -->
              <div class="px-4 py-3 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="font-mono-code text-xs font-extrabold px-2 py-0.5 rounded bg-purple-500/30 text-purple-200 border border-purple-400/40">
                    ${sourceLabel}
                  </span>
                  <span class="px-2 py-0.5 rounded text-[11px] font-semibold border ${typeBadge}">
                    ${item.relationshipType}
                  </span>
                </div>
                <span class="px-2 py-0.5 rounded text-[11px] font-mono-code font-bold border ${stateBadge}">
                  ${item.state}
                </span>
              </div>

              <!-- Institution Bar -->
              <div class="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                <div class="font-bold text-slate-800">
                  <i class="fa-solid fa-building-columns text-[#1E3A8A] mr-1"></i>
                  ${item.institutionName} (<span class="font-mono-code">${item.aicteId}</span>)
                </div>
                <button onclick="jumpToInstitution360('${item.aicteId}')" class="text-[11px] text-[#1E3A8A] font-semibold hover:underline cursor-pointer">
                  Open 360° →
                </button>
              </div>

              <!-- Side-by-Side Case Comparison -->
              <div class="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div onclick="jumpToCaseWorkbench('${item.caseA.id}')" class="p-3 rounded-lg bg-blue-50/50 border border-blue-200 cursor-pointer hover:bg-blue-50">
                  <div class="flex items-center justify-between">
                    <span class="font-mono-code font-bold text-xs text-[#1E3A8A]">${item.caseA.id}</span>
                    ${getBureauBadge(item.caseA.bureau)}
                  </div>
                  <p class="text-xs text-slate-700 mt-1.5 leading-snug">${item.caseA.summary}</p>
                </div>

                <div onclick="jumpToCaseWorkbench('${item.caseB.id}')" class="p-3 rounded-lg bg-purple-50/50 border border-purple-200 cursor-pointer hover:bg-purple-50">
                  <div class="flex items-center justify-between">
                    <span class="font-mono-code font-bold text-xs text-purple-900">${item.caseB.id}</span>
                    ${getBureauBadge(item.caseB.bureau)}
                  </div>
                  <p class="text-xs text-slate-700 mt-1.5 leading-snug">${item.caseB.summary}</p>
                </div>
              </div>

              <!-- Matched Entities & Explainable Match Details -->
              <div class="px-4 pb-4 space-y-2">
                <div class="flex flex-wrap gap-1.5">
                  ${(item.matchedEntities || []).map(ent => `
                    <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono-code text-[10px]">
                      <i class="fa-solid fa-tag text-amber-600 mr-1"></i>${ent}
                    </span>
                  `).join('')}
                </div>
                <p class="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <strong class="text-slate-900"><i class="fa-solid fa-list-check text-purple-600 mr-1"></i>${item.match_source === 'synthetic_demo_scenario' ? 'Synthetic Scenario Note:' : 'Explainable Match Signals:'}</strong> ${escapeHtml(item.aiExplanation || 'No explanation supplied.')}
                </p>
              </div>
            </div>

            <!-- Interactive Officer Decision Buttons -->
            ${item.state === 'Pending Review' ? `<div class="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <button
                  onclick="handleAiDecision('${item.id}', 'Confirmed Link')"
                  class="px-3 py-1.5 rounded-lg bg-[#1E3A8A] hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition"
                >
                  <i class="fa-solid fa-link"></i>
                  <span>Confirm Case Link</span>
                </button>
                <button
                  onclick="handleAiDecision('${item.id}', 'Merged Duplicate')"
                  class="px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition"
                >
                  <i class="fa-solid fa-code-merge"></i>
                  <span>Mark as Duplicate</span>
                </button>
              </div>
              <button
                onclick="handleAiDecision('${item.id}', 'Dismissed')"
                class="px-2.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-200 text-slate-600 text-xs font-medium cursor-pointer transition"
              >
                Dismiss
              </button>
            </div>` : ''}
          </div>
        `;
      }).join('');
    }

    async function handleAiDecision(suggestionId, decisionState) {
      const item = aiSuggestionsData.find(a => a.id === suggestionId);
      if (!item) return;
      if (!backendAvailable) return showBackendUnavailable();
      const actionKey = `suggestion:${suggestionId}`;
      if (pendingApiActions.has(actionKey)) return;
      pendingApiActions.add(actionKey);
      const actor = currentRole === 'ALL' ? 'Dr. R. K. Verma (Command Desk)' : currentRole;
      let link = backendCaseLinks.find(row => row.suggestion_id === suggestionId);
      if (!link) {
        link = backendCaseLinks.find(row =>
          (row.source_case_id === item.caseA.id && row.target_case_id === item.caseB.id) ||
          (row.source_case_id === item.caseB.id && row.target_case_id === item.caseA.id)
        );
      }
      let saved;
      try {
        if (!link) {
          backendCaseLinks = await apiRequest('/case-links');
          link = backendCaseLinks.find(row =>
            (row.source_case_id === item.caseA.id && row.target_case_id === item.caseB.id) ||
            (row.source_case_id === item.caseB.id && row.target_case_id === item.caseA.id)
          );
        }
        if (link) {
          saved = await apiRequest(`/case-links/${link.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ state: decisionState, actor })
          });
        } else {
          saved = await apiRequest('/case-links', {
            method: 'POST',
            body: JSON.stringify({
              source_case_id: item.caseA.id,
              target_case_id: item.caseB.id,
              relationship_type: item.relationshipType,
              similarity_score: item.similarity,
              state: decisionState,
              suggestion_id: suggestionId,
              note: item.aiExplanation,
              actor
            })
          });
        }
        item.state = decisionState;
        item.backendLinkId = saved.id;
        backendCaseLinks = [
          ...backendCaseLinks.filter(row => row.id !== saved.id),
          saved
        ];
      } catch (error) {
        showToast('AI-link decision failed', getBackendErrorMessage(error), 'error');
        pendingApiActions.delete(actionKey);
        return;
      }
      let refreshed = true;
      try {
        await syncBackendData();
      } catch (error) {
        refreshed = false;
        showToast('Saved, but view refresh failed', 'The case link was saved; reload to refresh analytics, suggestions, and audit views.', 'warning');
      }

      updateAllKpiBadges();
      renderCommandCenter();
      renderWorkbenchTable();
      renderCaseInspector(selectedCaseId);
      renderAnalyticsScreen();
      renderAuditTrail();
      renderAiSuggestions();
      showToast(
        refreshed ? `Case-Link Decision Recorded: ${decisionState}` : 'Decision saved; data may be stale',
        refreshed
          ? `${decisionState === 'Confirmed Link' ? 'Confirmed a case relationship between' : decisionState === 'Merged Duplicate' ? 'Marked as a duplicate (case records remain separate):' : 'Dismissed the candidate between'} ${item.caseA.id} (${item.caseA.bureau}) and ${item.caseB.id} (${item.caseB.bureau}).`
          : 'The database accepted the decision. Reconnect to refresh the linker, audit trail, and complaint relationship views.',
        refreshed ? (decisionState === 'Dismissed' ? 'warning' : 'success') : 'warning'
      );
      pendingApiActions.delete(actionKey);
    }

    async function runAiSuggestionRefresh() {
      const icon = document.getElementById('aiRefreshIcon');
      if (!backendAvailable) return showBackendUnavailable();
      const actionKey = 'suggestion-refresh';
      if (pendingApiActions.has(actionKey)) return;
      pendingApiActions.add(actionKey);
      icon.classList.add('fa-spin');
      let refreshLogged = false;
      try {
        await apiRequest('/audit-events', {
          method: 'POST',
          body: JSON.stringify({
            action_type: 'SUGGESTIONS_REFRESHED',
            entity_type: 'system',
            entity_id: 'LOCAL-RULE-SCAN',
            actor: currentRole === 'ALL' ? 'Command Desk' : currentRole,
            bureau_label: 'Local Rule-Based Matching',
            details: 'Officer requested a fresh list of explainable complaint-similarity candidates. Matching uses stored institution, category, and title/category text only; no AI service is called.'
          })
        });
        refreshLogged = true;
        await syncBackendData();
        updateAllKpiBadges();
        renderAiSuggestions();
        renderAuditTrail();
        showToast('Related-Case Candidates Refreshed', 'Candidates were read from persisted complaints and calculated with documented local rules. Each relationship still requires officer confirmation.', 'success');
      } catch (error) {
        showToast(
          refreshLogged ? 'Refresh logged; data may be stale' : 'Suggestion refresh could not be recorded',
          refreshLogged ? `The refresh event was saved, but candidate data could not be reloaded. ${getBackendErrorMessage(error)}` : getBackendErrorMessage(error),
          'warning'
        );
      } finally {
        icon.classList.remove('fa-spin');
        pendingApiActions.delete(actionKey);
      }
    }

    // -------------------------------------------------------------------------
    // 12. SCREEN 5: AUDIT EVENT HISTORY & GOVERNANCE LOG
    // -------------------------------------------------------------------------
    function renderAuditTrail() {
      const q = (document.getElementById('auditSearchInput')?.value || '').trim().toLowerCase();
      const actionFilter = document.getElementById('auditActionFilter')?.value || 'ALL';
      const bureauFilter = document.getElementById('auditBureauFilter')?.value || 'ALL';

      const filtered = auditLogsData.filter(log => {
        if (actionFilter !== 'ALL' && log.actionType !== actionFilter) return false;
        if (bureauFilter !== 'ALL' && log.bureau !== bureauFilter) return false;
        if (q) {
          const hay = `${log.entityId} ${log.actor} ${log.bureau} ${log.diff} ${log.actionType}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });

      const actionColors = {
        'STATUS_CHANGED': 'bg-blue-100 text-blue-900 border-blue-300',
        'NOTE_ADDED': 'bg-amber-100 text-amber-900 border-amber-300',
        'RELATIONSHIP_LINKED': 'bg-emerald-100 text-emerald-900 border-emerald-300',
        'DUPLICATE_MERGED': 'bg-purple-100 text-purple-900 border-purple-300',
        'SUGGESTIONS_REFRESHED': 'bg-indigo-100 text-indigo-900 border-indigo-300',
        'BUREAU_ESCALATION': 'bg-rose-100 text-rose-900 border-rose-300',
        'CASE_INGESTED': 'bg-teal-100 text-teal-900 border-teal-300',
        'EOA_HOLD_TOGGLED': 'bg-orange-100 text-orange-900 border-orange-300'
      };

      const tbody = document.getElementById('auditTableBody');
      tbody.innerHTML = filtered.map(log => `
        <tr class="${log.isNew ? 'bg-amber-50/70' : 'hover:bg-slate-50'}">
          <td class="py-3 px-4 font-mono-code text-[11px] text-slate-600 whitespace-nowrap">
            ${log.timestamp}
            ${!log.isDemo ? `<span class="ml-1.5 px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[9px] font-bold">DATABASE EVENT</span>` : ''}
            ${log.isDemo ? `<span class="ml-1.5 px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[9px] font-bold">SYNTHETIC DEMO</span>` : ''}
          </td>
          <td class="py-3 px-4 whitespace-nowrap">
            <span class="font-mono-code text-[11px] font-bold px-2 py-0.5 rounded border ${actionColors[log.actionType] || 'bg-slate-100 text-slate-800'}">
              ${log.actionType}
            </span>
          </td>
          <td class="py-3 px-4 font-mono-code font-bold text-[#1E3A8A] whitespace-nowrap">
            ${log.entityId}
          </td>
          <td class="py-3 px-4 whitespace-nowrap">
            <div class="font-semibold text-slate-900">${log.actor}</div>
            <div class="text-[10px] text-slate-500">${log.bureau}</div>
          </td>
          <td class="py-3 px-4 text-slate-700 max-w-xl">
            ${log.diff}
          </td>
          <td class="py-3 px-4 font-mono-code text-[11px] text-slate-600 whitespace-nowrap">
            ${log.eventId ? `EVT-${log.eventId}` : '—'}
          </td>
        </tr>
      `).join('');
    }

    async function exportAuditCsv() {
      if (!backendAvailable) return showBackendUnavailable();
      try {
        const csv = await apiRequest('/reports/audit.csv', { responseType: 'text' });
        triggerBrowserDownload(csv, 'AICTE_SIH26264_Audit_Trail.csv', 'text/csv');
        showToast('Audit Trail CSV Exported', 'Downloaded persisted application audit events.', 'success');
      } catch (error) { showToast('Audit export failed', getBackendErrorMessage(error), 'error'); }
    }

    // -------------------------------------------------------------------------
    // 13. SCREEN 6: ANALYTICS, SLA HEATMAPS & CSV/JSON REPORTS
    // -------------------------------------------------------------------------
    function renderAnalyticsScreen() {
      const data = analyticsData;
      const bureauSlaData = data?.bureau_stats || [];
      document.getElementById('analyticsBureauSlaBars').innerHTML = bureauSlaData.map(b => `
        <div class="space-y-1">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-slate-800">${b.name}</span>
            <div class="font-mono-code text-[11px] flex items-center gap-3">
              <span class="text-slate-600">Avg Resolution: <strong>${b.avgDays}d</strong> (Target: ${b.targetDays}d)</span>
              <span class="font-bold ${b.compliance >= 75 ? 'text-emerald-700' : 'text-rose-700'}">${b.compliance}% SLA Met</span>
            </div>
          </div>
          <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div class="${b.color} h-full rounded-full" style="width: ${b.compliance}%"></div>
          </div>
        </div>
      `).join('') || '<p class="text-xs text-slate-500">No persisted complaints are available for SLA analysis.</p>';

      const violations = data?.categories || [];
      const totalCaseCount = document.getElementById('analyticsTotalCaseCount');
      if (totalCaseCount) totalCaseCount.textContent = `${casesData.length} TOTAL CASES`;
      document.getElementById('analyticsViolationCategories').innerHTML = violations.map(v => `
        <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-slate-900">${v.category}</span>
            <span class="font-mono-code font-bold text-[#1E3A8A]">${v.count} Cases (${v.pct}%)</span>
          </div>
          <div class="flex items-center justify-between text-[11px] text-slate-500"><span>Persisted complaint category</span></div>
          <div class="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden"><div class="bg-[#1E3A8A] h-full rounded-full" style="width: ${v.pct}%"></div></div>
        </div>
      `).join('') || '<p class="text-xs text-slate-500">No category data available.</p>';

      const regions = data?.regions || [];
      document.getElementById('regionalHeatmapGrid').innerHTML = regions.map(r => {
        const cardStyle = r.level === 'High Risk' ? 'bg-rose-50/80 border-rose-300 text-rose-950'
          : r.level === 'Moderate' ? 'bg-amber-50/80 border-amber-300 text-amber-950'
          : 'bg-emerald-50/70 border-emerald-300 text-emerald-950';
        return `
          <div class="p-3.5 rounded-xl border ${cardStyle} space-y-2">
            <div class="flex items-center justify-between"><span class="text-xs font-bold">${r.name}</span><span class="font-mono-code text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/80 border border-current">${r.level}</span></div>
            <div class="grid grid-cols-3 gap-1 pt-1 text-center font-mono-code">
              <div class="bg-white/80 p-1.5 rounded"><div class="text-sm font-extrabold">${r.cases}</div><div class="text-[9px] uppercase opacity-75">Cases</div></div>
              <div class="bg-white/80 p-1.5 rounded"><div class="text-sm font-extrabold text-rose-700">${r.overdue}</div><div class="text-[9px] uppercase opacity-75">Overdue</div></div>
              <div class="bg-white/80 p-1.5 rounded"><div class="text-sm font-extrabold text-indigo-900">${r.instFlagged}</div><div class="text-[9px] uppercase opacity-75">Inst.</div></div>
            </div>
          </div>`;
      }).join('') || '<p class="text-xs text-slate-500">No regional complaint data available.</p>';
      updateExportPreviewCount();
    }
    function getFilteredExportCases() {
      const bureau = document.getElementById('expBureau')?.value || 'ALL';
      const priority = document.getElementById('expPriority')?.value || 'ALL';
      const scope = document.getElementById('expScope')?.value || 'ALL';

      return casesData.filter(c => {
        if (bureau !== 'ALL' && c.bureau !== bureau) return false;
        if (priority === 'CRITICAL_HIGH' && c.priority !== 'Critical' && c.priority !== 'High') return false;
        if (priority !== 'ALL' && priority !== 'CRITICAL_HIGH' && c.priority !== priority) return false;
        if (scope === 'OPEN' && (c.status === 'Resolved' || c.status === 'Closed')) return false;
        if (scope === 'OVERDUE' && !c.isOverdue) return false;
        if (scope === 'RESOLVED' && c.status !== 'Resolved' && c.status !== 'Closed') return false;
        return true;
      });
    }

    function updateExportPreviewCount() {
      const matched = getFilteredExportCases();
      const badge = document.getElementById('exportMatchCountBadge');
      if (badge) {
        badge.textContent = `${matched.length} Detailed Records Matched for Export`;
      }
    }

    function triggerBrowserDownload(content, filename, mimeType) {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    async function downloadFilteredCsvReport() {
      if (!backendAvailable) return showBackendUnavailable();
      const params = new URLSearchParams({
        bureau: document.getElementById('expBureau')?.value || 'ALL',
        priority: document.getElementById('expPriority')?.value || 'ALL',
        scope: document.getElementById('expScope')?.value || 'ALL'
      });
      try {
        const csv = await apiRequest(`/reports/complaints.csv?${params}`, { responseType: 'text' });
        triggerBrowserDownload(csv, 'AICTE_SIH26264_Filtered_Complaint_Report.csv', 'text/csv');
        showToast('CSV Report Downloaded', 'Exported persisted complaint records matching the selected filters.', 'success');
      } catch (error) { showToast('CSV export failed', getBackendErrorMessage(error), 'error'); }
    }

    async function downloadShcJsonDossier() {
      if (!backendAvailable) return showBackendUnavailable();
      const params = new URLSearchParams({
        bureau: document.getElementById('expBureau')?.value || 'ALL',
        priority: document.getElementById('expPriority')?.value || 'ALL',
        scope: document.getElementById('expScope')?.value || 'ALL'
      });
      try {
        const json = await apiRequest(`/reports/shc.json?${params}`, { responseType: 'text' });
        triggerBrowserDownload(json, 'AICTE_Standing_Hearing_Committee_Dossier_SIH26264.json', 'application/json');
        showToast('SHC Dossier Generated', 'Downloaded a filtered dossier generated from persisted records.', 'success');
      } catch (error) { showToast('SHC dossier export failed', getBackendErrorMessage(error), 'error'); }
    }

    // -------------------------------------------------------------------------
    // 14. MODAL: MULTI-SOURCE COMPLAINT INGESTION SIMULATOR
    // -------------------------------------------------------------------------
    function populateIngestInstitutionDropdown(selectedPid) {
      const select = document.getElementById('newCaseInstitution');
      select.innerHTML = institutionsData.map(inst => `
        <option value="${inst.aicteId}" ${inst.aicteId === selectedPid ? 'selected' : ''}>
          ${inst.name} (PID: ${inst.aicteId}) — ${inst.state}
        </option>
      `).join('');
      previewCrossBureauConflict();
    }

    function openIngestModal() {
      if (!backendAvailable) return showBackendUnavailable();
      if (!institutionsData.length || !bureausData.length) {
        return showToast('Cannot register a case', 'The API has not supplied institution and bureau records yet.', 'error');
      }
      populateIngestInstitutionDropdown(selectedInstitutionId);
      document.getElementById('ingestModal').classList.remove('hidden');
    }

    function openIngestModalForInst(aicteId) {
      if (!backendAvailable) return showBackendUnavailable();
      populateIngestInstitutionDropdown(aicteId);
      document.getElementById('ingestModal').classList.remove('hidden');
    }

    function closeIngestModal() {
      document.getElementById('ingestModal').classList.add('hidden');
    }

    function previewCrossBureauConflict() {
      const pid = document.getElementById('newCaseInstitution')?.value;
      const chosenBureau = document.getElementById('newCaseBureau')?.value;
      const previewBox = document.getElementById('ingestAiPreviewBox');
      if (!pid || !previewBox) return;

      const existing = casesData.filter(c => c.aicteId === pid);
      const otherBureauCases = existing.filter(c => c.bureau !== chosenBureau);

      if (otherBureauCases.length > 0) {
        previewBox.innerHTML = `
          <div class="font-bold flex items-center gap-1.5 text-purple-900">
            <i class="fa-solid fa-wand-magic-sparkles text-purple-700"></i>
            <span>Related-Case Review Candidates (PID: ${pid})</span>
          </div>
          <p class="mt-0.5">
            This institution already has <strong>${otherBureauCases.length} complaint(s)</strong> in other bureaus (${[...new Set(otherBureauCases.map(c => c.bureau))].join(', ')}). After ingestion, deterministic candidates will be available in Screen 4; no relationship is created until an officer confirms it.
          </p>
        `;
      } else {
        previewBox.innerHTML = `
          <div class="font-bold flex items-center gap-1.5 text-purple-900">
            <i class="fa-solid fa-circle-info"></i>
            <span>Pre-Ingestion Check (PID: ${pid})</span>
          </div>
          <p class="mt-0.5">Case will be bound to AICTE Permanent ID ${pid}. Related-case candidates are generated from persisted complaint details using local rules.</p>
        `;
      }
    }

    async function handleNewCaseSubmit(e) {
      e.preventDefault();
      if (!backendAvailable) return showBackendUnavailable();
      const submitButton = e.submitter || e.target.querySelector('button[type="submit"]');
      if (submitButton?.disabled) return;
      const source = document.getElementById('newCaseSource').value;
      const aicteId = document.getElementById('newCaseInstitution').value;
      const bureau = document.getElementById('newCaseBureau').value;
      const category = document.getElementById('newCaseCategory').value;
      const priority = document.getElementById('newCasePriority').value;
      const title = document.getElementById('newCaseTitle').value.trim();
      const complainant = document.getElementById('newCaseComplainant').value;
      const officer = document.getElementById('newCaseOfficer').value.trim() || 'Dr. R. K. Verma';
      const institution = institutionsData.find(item => item.aicteId === aicteId);
      const bureauCode = getBureauCode(bureau);
      if (!institution || !bureauCode || title.length < 5) {
        showToast('Complaint registration failed', 'Choose an API institution and bureau, and enter a title of at least 5 characters.', 'error');
        return;
      }
      if (submitButton) submitButton.disabled = true;
      const actionKey = 'complaint-create';
      if (pendingApiActions.has(actionKey)) return;
      pendingApiActions.add(actionKey);
      showToast('Registering complaint', 'Saving the complaint and initial workflow/audit events.', 'info');
      let caseId;
      let saved;
      const localDateParts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit'
      }).formatToParts(new Date()).reduce((parts, part) => {
        if (part.type !== 'literal') parts[part.type] = part.value;
        return parts;
      }, {});
      const filedDate = `${localDateParts.year}-${localDateParts.month}-${localDateParts.day}`;
      const dueDate = new Date(`${filedDate}T00:00:00Z`);
      const prioritySlaDays = { Critical: 7, High: 15, Medium: 30, Low: 45 };
      dueDate.setUTCDate(dueDate.getUTCDate() + prioritySlaDays[priority]);
      try {
        ({ case_id: caseId } = await apiRequest('/complaints/next-id'));
        saved = await apiRequest('/complaints', {
          method: 'POST',
          body: JSON.stringify({
            case_id: caseId, institution_id: institution.aicteId, bureau_code: bureauCode,
            category, title, priority, status: 'Submitted', assigned_officer: officer,
            source, complainant, filed_date: filedDate,
            due_date: dueDate.toISOString().slice(0, 10),
            linked_case_ids: [], resolution_note: null,
            actor: currentRole === 'ALL' ? officer : currentRole
          })
        });
      } catch (error) {
        showToast('Complaint registration failed', getBackendErrorMessage(error), 'error');
        if (submitButton) submitButton.disabled = false;
        pendingApiActions.delete(actionKey);
        return;
      }
      selectedCaseId = saved.case_id;
      closeIngestModal();
      document.getElementById('newCaseTitle').value = '';
      let refreshed = true;
      try { await syncBackendData(); }
      catch (_error) {
        refreshed = false;
        casesData.unshift(mapBackendComplaint(saved));
        recomputeKpiDelta();
      }
      renderCommandCenter();
      renderInstitutionList();
      renderInstitutionDossier(institution.aicteId);
      renderWorkbenchTable();
      renderCaseInspector(selectedCaseId);
      renderAiSuggestions();
      renderAuditTrail();
      renderAnalyticsScreen();
      if (refreshed) showToast(`New Case Ingested: ${saved.case_id}`, `Saved to the database and assigned to ${bureau}. Related-case candidates require officer confirmation.`, 'success');
      else showToast(`Case ${saved.case_id} saved`, 'The database write succeeded, but refreshing current views failed. Reload the page to fetch the saved record.', 'warning');
      if (submitButton) submitButton.disabled = false;
      pendingApiActions.delete(actionKey);
    }
    // 15. ARCHITECTURE & SPEC DRAWER TOGGLE
    // -------------------------------------------------------------------------
    function toggleSpecDrawer(open) {
      const drawer = document.getElementById('specDrawerBackdrop');
      if (open) {
        drawer.classList.remove('hidden');
      } else {
        drawer.classList.add('hidden');
      }
    }

    // Initialize Application on Load
    window.onload = async function () {
      showToast('Connecting to AICTE NEXUS API', 'Loading institutions, complaints, bureaus, related-case candidates, analytics, and audit events.', 'info');
      try {
        await syncBackendData();
        showToast('Backend connected', `${institutionsData.length} institutions, ${casesData.length} complaints, and ${bureausData.length} bureaus loaded.`, 'success');
      } catch (error) {
        institutionsData.splice(0, institutionsData.length);
        casesData = [];
        bureausData = [];
        auditLogsData = [];
        aiSuggestionsData = [];
        backendCaseLinks = [];
        analyticsData = null;
        selectedInstitutionId = '';
        selectedCaseId = '';
        setApiConnectionStatus('offline', getBackendErrorMessage(error));
        showToast('Backend connection failed', getBackendErrorMessage(error), 'error');
      }
      renderCurrentScreen();
      window.setInterval(async () => {
        if (document.visibilityState === 'hidden' || syncInFlight) return;
        setApiConnectionStatus('syncing');
        try {
          await syncBackendData();
          renderCurrentScreen();
        } catch (error) {
          showToast('Data refresh failed', `Showing the last loaded data, which may be stale. ${getBackendErrorMessage(error)}`, 'warning');
        }
      }, 60000);
    };
  

