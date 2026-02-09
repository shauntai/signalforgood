import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SEED_VERSION = "v2-2026-02-09";

const BUCKET_IDS: Record<string, string> = {
  education: "195b7520-51a2-493e-b708-51276dc20117",
  jobs: "04317627-acf0-4a45-80df-ecaaca212939",
  housing: "4c87629c-a6b7-490c-8c4b-4cbdd0f10648",
  health: "28914499-b4a0-474c-99e5-71f152fb72b7",
};

const AGENT_IDS = [
  "8fa56c45-d348-42e4-81b7-77ab008443cc", // Policy Analyst
  "67241dc5-55c6-4c16-843c-efe79be63e46", // Budget Skeptic
  "765b6f6f-6115-4044-889d-18f0f1a4eb3d", // Community Advocate
  "90468a81-0508-4282-857f-78b0901210c3", // Data Scientist
  "cfece277-2ca0-463d-8786-620fa7912353", // Equity Reviewer
  "6b2353a0-cbaa-4f78-b5c7-73f61f876463", // Historian
  "82932a04-22c1-4ca5-baac-81b4bb590e89", // Implementation Lead
  "8161ded9-af3c-40c5-9860-15561bd7d752", // Mediator
  "1bf2a23a-13f2-4400-96af-a2dd4b8771e8", // Program Designer
  "612bf54c-d8f3-4069-a4d7-0e16d3fce15b", // Risk Officer
  "53c418e7-d094-4c37-b3ed-82b1937923f8", // Systems Thinker
  "007246f4-1d51-4ada-8d71-f6473b907257", // Youth Voice
];

const LANES: ("proposal" | "support" | "counter")[] = ["proposal", "support", "counter"];

const ROUND_NAMES = ["Define", "Propose", "Stress Test", "Converge", "Implementation"];

const MISSION_TOPICS: Record<string, { title: string; question: string; hook: string }[]> = {
  education: [
    { title: "Phone bans in K-12 classrooms", question: "Should schools enforce complete phone bans during class hours?", hook: "France banned phones. US schools are split. What does the evidence say?" },
    { title: "AI tutoring equity in Title I schools", question: "Can AI tutoring close achievement gaps without widening the digital divide?", hook: "AI tutors promise personalized learning but require infrastructure low-income schools lack." },
    { title: "Universal pre-K funding models", question: "What funding model best sustains universal pre-K without quality trade-offs?", hook: "States that launched universal pre-K saw mixed quality results." },
    { title: "Teacher pay restructuring", question: "Should teacher compensation be restructured to include performance incentives?", hook: "The average teacher salary hasn't kept pace with inflation since 2010." },
    { title: "Community college free tuition impact", question: "Does free community college tuition increase completion rates?", hook: "Tennessee Promise showed enrollment spikes but completion remained flat." },
    { title: "School resource officers effectiveness", question: "Do school resource officers improve safety or worsen school-to-prison pipeline?", hook: "Suspension rates correlate with SRO presence in some districts." },
    { title: "Dual enrollment program expansion", question: "Should dual enrollment be available to all high school students regardless of GPA?", hook: "Dual enrollment students graduate college at higher rates." },
    { title: "Standardized testing alternatives", question: "What assessment models can replace standardized tests while maintaining accountability?", hook: "Portfolio-based assessment pilots show promise in Vermont and New Hampshire." },
    { title: "School meal program universality", question: "Should universal free school meals replace means-tested programs?", hook: "Schools with universal meals see reduced stigma and higher participation." },
    { title: "Digital literacy curriculum mandates", question: "Should digital literacy be a required subject from elementary school?", hook: "Only 11 states require computer science education in K-12." },
    { title: "Charter school accountability", question: "How should charter school performance be measured against traditional public schools?", hook: "Charter school results vary dramatically by state regulatory framework." },
    { title: "Student mental health services in schools", question: "Should schools be required to provide on-site mental health counselors?", hook: "Student anxiety and depression rates have doubled since 2012." },
    { title: "Bilingual education program models", question: "Which bilingual education model produces the best long-term outcomes?", hook: "Dual-language programs outperform English-only after 6 years." },
    { title: "College admissions reform post-affirmative action", question: "How should colleges achieve diversity after the Supreme Court ruling?", hook: "Applications from underrepresented groups dropped 20% at selective schools." },
    { title: "Career and technical education funding", question: "Should CTE programs receive equal funding as college-prep tracks?", hook: "CTE graduates earn 12% more than peers in the first decade after high school." },
    { title: "Remote learning infrastructure", question: "What infrastructure is needed to make remote learning effective long-term?", hook: "30% of rural students lack reliable broadband for synchronous learning." },
    { title: "Teacher recruitment from STEM fields", question: "How can schools recruit more STEM professionals into teaching?", hook: "57% of STEM teacher positions go unfilled in high-need districts." },
    { title: "School funding formula reform", question: "Should per-pupil funding be weighted by student need rather than property tax base?", hook: "The richest districts spend 3x more per student than the poorest." },
    { title: "Early childhood literacy interventions", question: "Which early literacy interventions show the strongest evidence of impact?", hook: "Children not reading at grade level by 3rd grade are 4x more likely to drop out." },
    { title: "Higher education accreditation reform", question: "Does the current accreditation system protect students or entrench incumbents?", hook: "Accreditation standards haven't meaningfully changed since the 1990s." },
  ],
  jobs: [
    { title: "Gig worker classification and protections", question: "Should gig workers be classified as employees with full benefits?", hook: "58 million Americans do gig work. Most lack health insurance through their platform." },
    { title: "AI displacement and workforce retraining", question: "What retraining programs effectively help workers displaced by automation?", hook: "McKinsey estimates 30% of work hours could be automated by 2030." },
    { title: "Four-day work week feasibility", question: "Can a four-day work week maintain productivity across industries?", hook: "UK pilot: 92% of companies kept the four-day week after the trial." },
    { title: "Minimum wage regional adjustment", question: "Should minimum wage be set regionally based on cost of living?", hook: "Federal minimum wage hasn't changed since 2009." },
    { title: "Portable benefits systems", question: "Can portable benefits work across employers and employment types?", hook: "Workers change jobs 12 times on average. Benefits shouldn't reset each time." },
    { title: "Apprenticeship expansion beyond trades", question: "Should the apprenticeship model expand to tech, healthcare, and white-collar fields?", hook: "Germany's apprenticeship system covers 330 occupations. The US covers fewer than 50." },
    { title: "Remote work tax implications", question: "How should tax policy adapt to permanent remote and hybrid work?", hook: "Remote workers may owe taxes in multiple states simultaneously." },
    { title: "Fair chance hiring for formerly incarcerated", question: "Do ban-the-box policies increase employment without increasing risk?", hook: "70 million Americans have a criminal record. Employment cuts recidivism by 50%." },
    { title: "Paid family leave federal mandate", question: "Should the US mandate paid family leave at the federal level?", hook: "The US is the only OECD country without federal paid parental leave." },
    { title: "Credential inflation in hiring", question: "Are degree requirements screening out qualified candidates?", hook: "60% of job postings require a degree, but only 40% of workers have one." },
    { title: "Workplace surveillance boundaries", question: "Where should the line be drawn on employee monitoring technology?", hook: "78% of employers now use some form of digital employee monitoring." },
    { title: "Union modernization for the gig economy", question: "How can labor organizing adapt to platform and gig work structures?", hook: "Union membership is at 10%. Gig workers have no collective bargaining path." },
    { title: "Youth employment summer programs", question: "Do summer youth employment programs reduce violence and improve outcomes?", hook: "Chicago's One Summer Plus reduced violence arrests by 43%." },
    { title: "Salary transparency legislation", question: "Does requiring salary ranges in job postings reduce pay gaps?", hook: "Colorado's salary transparency law showed 5% narrowing in gender pay gaps." },
    { title: "Skills-based hiring government adoption", question: "Should government agencies lead the shift to skills-based hiring?", hook: "Federal agencies still require degrees for 60% of roles." },
    { title: "Worker cooperative tax incentives", question: "Should worker-owned cooperatives receive tax benefits similar to ESOPs?", hook: "Worker co-ops have 30% lower failure rates than traditional businesses." },
    { title: "Freelancer retirement security", question: "How can independent workers build retirement security without employer matching?", hook: "40% of freelancers have zero retirement savings." },
    { title: "Green jobs transition planning", question: "How should fossil fuel communities plan workforce transitions to green energy?", hook: "Coal employment dropped 50% in a decade. New energy jobs don't always go to the same workers." },
    { title: "Childcare as workforce infrastructure", question: "Should childcare be treated as essential infrastructure for workforce participation?", hook: "2 million parents left the workforce due to childcare gaps." },
    { title: "Automation tax proposals", question: "Should companies pay a tax on automated jobs to fund retraining?", hook: "Bill Gates proposed a robot tax. Economists remain divided." },
  ],
  housing: [
    { title: "Rent control expansion effectiveness", question: "Does expanding rent control reduce displacement without reducing supply?", hook: "Stanford study: rent control saved tenants 5% but reduced supply by 15%." },
    { title: "Zoning reform for missing middle housing", question: "Should cities eliminate single-family zoning to allow duplexes and triplexes?", hook: "Minneapolis eliminated single-family zoning. New permits tripled." },
    { title: "Community land trust scaling", question: "Can community land trusts be scaled to address the affordable housing crisis?", hook: "CLTs keep homes affordable permanently, but only serve 300,000 households nationally." },
    { title: "Housing first for chronic homelessness", question: "Is Housing First the most cost-effective approach to chronic homelessness?", hook: "Housing First programs reduce ER visits by 60% and cut public costs." },
    { title: "Inclusionary zoning effectiveness", question: "Do inclusionary zoning mandates produce enough affordable units?", hook: "IZ policies produce only 1-3% of new units as affordable in most cities." },
    { title: "Accessory dwelling unit policy", question: "Should cities streamline ADU permitting to increase housing supply?", hook: "LA permitted 20,000 ADUs after reforms. Most cities still restrict them." },
    { title: "Public housing reinvestment", question: "Should the US reinvest in public housing construction?", hook: "The US hasn't built significant public housing since the 1970s. Waitlists average 2+ years." },
    { title: "Eviction prevention programs", question: "Which eviction prevention models show the strongest outcomes?", hook: "Eviction filings affect 3.6 million households annually." },
    { title: "Corporate landlord regulation", question: "Should institutional investors be restricted from buying single-family homes?", hook: "Institutional investors own 3% of single-family rentals but 25% in some zip codes." },
    { title: "Modular and prefab housing for affordability", question: "Can modular construction meaningfully reduce housing costs?", hook: "Modular homes cost 10-20% less but face zoning and financing barriers." },
    { title: "NIMBY vs YIMBY: community input reform", question: "Should community review processes be streamlined to speed housing production?", hook: "Environmental review adds 2-3 years to housing projects in California." },
    { title: "Tiny home villages for transitional housing", question: "Are tiny home communities an effective bridge to permanent housing?", hook: "Portland's tiny home villages house 300+ people at a fraction of shelter costs." },
    { title: "Section 8 voucher reform", question: "How should Housing Choice Vouchers be reformed to improve outcomes?", hook: "Only 1 in 4 eligible households receives a voucher due to funding limits." },
    { title: "Property tax reform for affordability", question: "Can property tax reform prevent displacement in gentrifying neighborhoods?", hook: "Detroit's over-assessment displaced thousands of Black homeowners." },
    { title: "Mixed-income development requirements", question: "Do mixed-income developments create better outcomes than concentrated affordable housing?", hook: "Moving to Opportunity study showed lasting health and earnings gains." },
    { title: "Co-living and shared housing policy", question: "Should cities update occupancy limits to allow co-living models?", hook: "Co-living reduces per-person housing costs by 20-30% in high-cost cities." },
    { title: "Tenant right to counsel in eviction", question: "Should tenants have a right to legal representation in eviction proceedings?", hook: "NYC's right to counsel reduced evictions by 30% in covered zip codes." },
    { title: "Impact fees on new development", question: "Do impact fees fund infrastructure or just raise housing prices?", hook: "Average impact fees exceed $20,000 per unit in some jurisdictions." },
    { title: "Vacant property tax and land banking", question: "Should vacant properties face penalty taxes to incentivize use?", hook: "17 million housing units sit vacant while 600,000 people are homeless." },
    { title: "Climate-resilient affordable housing", question: "How should affordable housing be built to withstand climate impacts?", hook: "FEMA buyouts displace low-income residents without relocation support." },
  ],
  health: [
    { title: "Opioid crisis response strategies", question: "What combination of interventions most effectively reduces opioid deaths?", hook: "Opioid overdoses killed 80,000 Americans last year. Treatment capacity lags." },
    { title: "Emergency room triage reform", question: "Can AI-assisted triage reduce ER wait times without compromising safety?", hook: "Average ER wait is 2.5 hours. AI triage pilots cut it to 45 minutes." },
    { title: "Medicaid expansion in holdout states", question: "What outcomes justify Medicaid expansion in the 10 remaining holdout states?", hook: "Expansion states saw 6% lower mortality in low-income populations." },
    { title: "Community health worker programs", question: "Should community health workers be integrated into primary care teams?", hook: "CHW programs show $5 return for every $1 invested in preventive care." },
    { title: "Drug pricing transparency requirements", question: "Would drug pricing transparency actually lower costs for patients?", hook: "Insulin costs $10 to make but retails for $300 in the US." },
    { title: "Maternal mortality reduction strategies", question: "What interventions most reduce maternal mortality for Black women?", hook: "Black women die from pregnancy complications at 3x the rate of white women." },
    { title: "Telehealth permanence post-pandemic", question: "Should pandemic telehealth flexibilities become permanent?", hook: "Telehealth visits dropped 70% when temporary waivers expired." },
    { title: "Mental health parity enforcement", question: "Is the Mental Health Parity Act being adequately enforced?", hook: "Insurers deny mental health claims at 2x the rate of medical claims." },
    { title: "School-based health centers", question: "Should every Title I school have an on-site health center?", hook: "School-based health centers reduce absenteeism by 30%." },
    { title: "Social determinants of health screening", question: "Should clinicians screen for social determinants during primary care visits?", hook: "80% of health outcomes are determined by non-clinical factors." },
    { title: "Public health infrastructure modernization", question: "How should public health data systems be modernized after COVID?", hook: "Many health departments still use fax machines for disease reporting." },
    { title: "Harm reduction program expansion", question: "Should harm reduction programs including safe consumption sites be expanded?", hook: "Supervised consumption sites in Canada prevented 10,000+ overdoses." },
    { title: "Rural hospital closure prevention", question: "What policy interventions can prevent rural hospital closures?", hook: "140 rural hospitals have closed since 2010. 600+ are at risk." },
    { title: "Healthcare workforce shortage solutions", question: "How can the US address projected shortages of 120,000 physicians by 2030?", hook: "Medical school capacity hasn't grown proportionally to population." },
    { title: "Lead exposure elimination in housing", question: "What is the most cost-effective strategy to eliminate childhood lead exposure?", hook: "Lead exposure costs the US economy $80 billion annually in lost productivity." },
    { title: "Behavioral health integration models", question: "Which behavioral health integration model works best in primary care settings?", hook: "Collaborative care model reduces depression by 50% vs usual care." },
    { title: "Food as medicine programs", question: "Should health insurers cover medically tailored meal programs?", hook: "Produce prescription programs reduce HbA1c by 0.8 points in diabetic patients." },
    { title: "Vaccine equity distribution", question: "How should vaccine distribution be structured to ensure equity?", hook: "COVID vaccine coverage lagged 15 percentage points in lowest-income zip codes." },
    { title: "Air quality health impact regulation", question: "Should EPA air quality standards be tightened based on recent health evidence?", hook: "Air pollution causes 200,000 excess deaths annually in the US." },
    { title: "Dental care Medicaid coverage for adults", question: "Should comprehensive dental care be covered under Medicaid for all adults?", hook: "Only 13 states offer comprehensive adult dental coverage under Medicaid." },
  ],
};

const SOURCES_BY_BUCKET: Record<string, { title: string; publisher: string; url: string; source_type: string }[]> = {
  education: [
    { title: "The Condition of Education 2025", publisher: "National Center for Education Statistics", url: "https://nces.ed.gov/programs/coe/", source_type: "government" },
    { title: "Effective Teaching Strategies Meta-Analysis", publisher: "Stanford University CREDO", url: "https://credo.stanford.edu/", source_type: "university" },
    { title: "School Finance Equity Report", publisher: "Education Trust", url: "https://edtrust.org/", source_type: "nonprofit" },
    { title: "Teacher Workforce Study 2025", publisher: "RAND Corporation", url: "https://www.rand.org/education-and-labor.html", source_type: "research" },
    { title: "Early Childhood Longitudinal Study", publisher: "Department of Education", url: "https://nces.ed.gov/ecls/", source_type: "government" },
    { title: "Digital Learning Effectiveness Review", publisher: "Brookings Institution", url: "https://www.brookings.edu/topic/education/", source_type: "nonprofit" },
    { title: "High School Completion and Outcomes", publisher: "Georgetown CEW", url: "https://cew.georgetown.edu/", source_type: "university" },
    { title: "Evidence-Based Literacy Interventions", publisher: "What Works Clearinghouse", url: "https://ies.ed.gov/ncee/wwc/", source_type: "government" },
    { title: "Charter School Performance Study", publisher: "University of Arkansas", url: "https://scdp.uark.edu/", source_type: "university" },
    { title: "College Completion Rates Analysis", publisher: "National Student Clearinghouse", url: "https://nscresearchcenter.org/", source_type: "research" },
    { title: "School Safety and Climate Survey", publisher: "CDC Youth Risk Behavior Survey", url: "https://www.cdc.gov/yrbs/", source_type: "government" },
    { title: "Bilingual Education Outcomes Meta-Analysis", publisher: "American Educational Research Journal", url: "https://journals.sagepub.com/home/aer", source_type: "journal" },
    { title: "Teacher Compensation International Comparison", publisher: "OECD Education at a Glance", url: "https://www.oecd.org/education/education-at-a-glance/", source_type: "government" },
    { title: "CTE Program Effectiveness Study", publisher: "National Research Center for CTE", url: "https://www.nrccte.org/", source_type: "research" },
    { title: "Student Mental Health Trends Report", publisher: "American Psychological Association", url: "https://www.apa.org/", source_type: "research" },
    { title: "School Funding Formula Analysis", publisher: "Education Law Center", url: "https://edlawcenter.org/", source_type: "nonprofit" },
    { title: "Remote Learning Infrastructure Assessment", publisher: "FCC Broadband Report", url: "https://www.fcc.gov/broadband-data", source_type: "government" },
    { title: "Pre-K Quality Standards Review", publisher: "NIEER State of Preschool", url: "https://nieer.org/", source_type: "research" },
    { title: "Dual Enrollment Impact Study", publisher: "Community College Research Center", url: "https://ccrc.tc.columbia.edu/", source_type: "university" },
    { title: "Accreditation System Review", publisher: "Government Accountability Office", url: "https://www.gao.gov/education", source_type: "government" },
    { title: "School Discipline Policy Analysis", publisher: "Civil Rights Project UCLA", url: "https://civilrightsproject.ucla.edu/", source_type: "university" },
    { title: "STEM Teacher Pipeline Report", publisher: "National Science Foundation", url: "https://www.nsf.gov/statistics/", source_type: "government" },
    { title: "Summer Learning Loss Prevention", publisher: "RAND Corporation", url: "https://www.rand.org/", source_type: "research" },
    { title: "Higher Education Finance Trends", publisher: "State Higher Education Executive Officers", url: "https://sheeo.org/", source_type: "nonprofit" },
    { title: "Assessment Reform Pilot Results", publisher: "Center for Assessment", url: "https://www.nciea.org/", source_type: "research" },
    { title: "School Meals Program Impact Study", publisher: "USDA Food and Nutrition Service", url: "https://www.fns.usda.gov/", source_type: "government" },
    { title: "Technology in Classrooms Review", publisher: "International Society for Technology in Education", url: "https://www.iste.org/", source_type: "nonprofit" },
    { title: "Student Debt and Completion Analysis", publisher: "Federal Reserve Bank of New York", url: "https://www.newyorkfed.org/", source_type: "government" },
    { title: "Early Intervention Outcomes Research", publisher: "Heckman Equation Project", url: "https://heckmanequation.org/", source_type: "university" },
    { title: "Inclusive Education Practices Review", publisher: "National Center on Inclusive Education", url: "https://education.unh.edu/inclusive", source_type: "university" },
  ],
  jobs: [
    { title: "Future of Work Report 2025", publisher: "McKinsey Global Institute", url: "https://www.mckinsey.com/mgi/", source_type: "research" },
    { title: "Gig Economy Labor Statistics", publisher: "Bureau of Labor Statistics", url: "https://www.bls.gov/", source_type: "government" },
    { title: "Automation and Employment Projections", publisher: "Brookings Institution", url: "https://www.brookings.edu/topic/workforce/", source_type: "nonprofit" },
    { title: "Minimum Wage Impact Study", publisher: "Congressional Budget Office", url: "https://www.cbo.gov/", source_type: "government" },
    { title: "Worker Classification Legal Analysis", publisher: "Economic Policy Institute", url: "https://www.epi.org/", source_type: "nonprofit" },
    { title: "Apprenticeship Outcomes Database", publisher: "Department of Labor", url: "https://www.apprenticeship.gov/", source_type: "government" },
    { title: "Remote Work Productivity Study", publisher: "Stanford Institute for Economic Policy Research", url: "https://siepr.stanford.edu/", source_type: "university" },
    { title: "Fair Chance Hiring Outcomes", publisher: "RAND Corporation", url: "https://www.rand.org/labor.html", source_type: "research" },
    { title: "Paid Leave Cost-Benefit Analysis", publisher: "National Partnership for Women & Families", url: "https://www.nationalpartnership.org/", source_type: "nonprofit" },
    { title: "Skills-Based Hiring Research", publisher: "Harvard Business School", url: "https://www.hbs.edu/managing-the-future-of-work/", source_type: "university" },
    { title: "Employee Monitoring Survey", publisher: "American Management Association", url: "https://www.amanet.org/", source_type: "research" },
    { title: "Union Membership Trends", publisher: "Bureau of Labor Statistics", url: "https://www.bls.gov/news.release/union2.toc.htm", source_type: "government" },
    { title: "Youth Employment Program Evaluation", publisher: "University of Chicago Crime Lab", url: "https://urbanlabs.uchicago.edu/", source_type: "university" },
    { title: "Pay Transparency Impact Analysis", publisher: "National Bureau of Economic Research", url: "https://www.nber.org/", source_type: "research" },
    { title: "Green Jobs Transition Planning Guide", publisher: "International Labour Organization", url: "https://www.ilo.org/", source_type: "government" },
    { title: "Worker Cooperative Performance Data", publisher: "Democracy at Work Institute", url: "https://institute.coop/", source_type: "nonprofit" },
    { title: "Freelancer Financial Security Survey", publisher: "Freelancers Union", url: "https://www.freelancersunion.org/", source_type: "nonprofit" },
    { title: "Childcare and Workforce Participation", publisher: "Center for American Progress", url: "https://www.americanprogress.org/", source_type: "nonprofit" },
    { title: "Automation Tax Economic Modeling", publisher: "MIT Technology Review", url: "https://www.technologyreview.com/", source_type: "research" },
    { title: "Salary Transparency Legislation Review", publisher: "National Conference of State Legislatures", url: "https://www.ncsl.org/", source_type: "government" },
    { title: "Portable Benefits Feasibility Study", publisher: "Aspen Institute Future of Work Initiative", url: "https://www.aspeninstitute.org/", source_type: "nonprofit" },
    { title: "Four-Day Work Week Trial Results", publisher: "Autonomy Research", url: "https://autonomy.work/", source_type: "research" },
    { title: "Credential Inflation Analysis", publisher: "Georgetown Center on Education and the Workforce", url: "https://cew.georgetown.edu/", source_type: "university" },
    { title: "Workforce Retraining Effectiveness", publisher: "W.E. Upjohn Institute", url: "https://www.upjohn.org/", source_type: "research" },
    { title: "Platform Economy Labor Report", publisher: "International Labour Organization", url: "https://www.ilo.org/", source_type: "government" },
    { title: "Occupational Outlook Handbook 2025", publisher: "Bureau of Labor Statistics", url: "https://www.bls.gov/ooh/", source_type: "government" },
    { title: "Income Inequality Trends", publisher: "Federal Reserve Board", url: "https://www.federalreserve.gov/", source_type: "government" },
    { title: "Small Business Employment Data", publisher: "Small Business Administration", url: "https://www.sba.gov/", source_type: "government" },
    { title: "Retirement Security for Non-Traditional Workers", publisher: "AARP Public Policy Institute", url: "https://www.aarp.org/ppi/", source_type: "nonprofit" },
    { title: "Disability Employment Gap Analysis", publisher: "National Disability Institute", url: "https://www.nationaldisabilityinstitute.org/", source_type: "nonprofit" },
  ],
  housing: [
    { title: "State of the Nation's Housing 2025", publisher: "Harvard Joint Center for Housing Studies", url: "https://www.jchs.harvard.edu/", source_type: "university" },
    { title: "Rent Control Impact Study", publisher: "Stanford Institute for Economic Policy Research", url: "https://siepr.stanford.edu/", source_type: "university" },
    { title: "Zoning Reform Outcomes Analysis", publisher: "Brookings Institution", url: "https://www.brookings.edu/topic/housing/", source_type: "nonprofit" },
    { title: "Housing First Cost-Effectiveness", publisher: "Urban Institute", url: "https://www.urban.org/", source_type: "nonprofit" },
    { title: "Community Land Trust Impact Report", publisher: "Lincoln Institute of Land Policy", url: "https://www.lincolninst.edu/", source_type: "research" },
    { title: "Inclusionary Zoning Evaluation", publisher: "National Housing Conference", url: "https://nhc.org/", source_type: "nonprofit" },
    { title: "ADU Policy Implementation Review", publisher: "AARP Livable Communities", url: "https://www.aarp.org/livable-communities/", source_type: "nonprofit" },
    { title: "Public Housing Capital Needs Assessment", publisher: "HUD Office of Policy Development", url: "https://www.hud.gov/", source_type: "government" },
    { title: "Eviction Filing Trends Database", publisher: "Eviction Lab Princeton", url: "https://evictionlab.org/", source_type: "university" },
    { title: "Institutional Investment in Housing", publisher: "Federal Reserve Bank of Atlanta", url: "https://www.atlantafed.org/", source_type: "government" },
    { title: "Modular Construction Cost Analysis", publisher: "National Association of Home Builders", url: "https://www.nahb.org/", source_type: "research" },
    { title: "Environmental Review and Housing Delays", publisher: "Terner Center UC Berkeley", url: "https://ternercenter.berkeley.edu/", source_type: "university" },
    { title: "Section 8 Voucher Utilization Study", publisher: "Center on Budget and Policy Priorities", url: "https://www.cbpp.org/", source_type: "nonprofit" },
    { title: "Property Tax Assessment Equity", publisher: "University of Chicago Harris School", url: "https://harris.uchicago.edu/", source_type: "university" },
    { title: "Moving to Opportunity Long-Term Results", publisher: "Harvard Opportunity Insights", url: "https://opportunityinsights.org/", source_type: "university" },
    { title: "Homelessness Point-in-Time Count", publisher: "HUD Annual Homeless Assessment Report", url: "https://www.huduser.gov/", source_type: "government" },
    { title: "Right to Counsel Evaluation", publisher: "National Coalition for a Civil Right to Counsel", url: "https://www.civilrighttocounsel.org/", source_type: "nonprofit" },
    { title: "Impact Fee Analysis", publisher: "National Association of Home Builders", url: "https://www.nahb.org/", source_type: "research" },
    { title: "Vacant Property Tax Policy Review", publisher: "Lincoln Institute of Land Policy", url: "https://www.lincolninst.edu/", source_type: "research" },
    { title: "Climate Adaptation for Housing", publisher: "Federal Emergency Management Agency", url: "https://www.fema.gov/", source_type: "government" },
    { title: "Tiny Home Ordinance Review", publisher: "National League of Cities", url: "https://www.nlc.org/", source_type: "nonprofit" },
    { title: "Housing Supply Elasticity Study", publisher: "National Bureau of Economic Research", url: "https://www.nber.org/", source_type: "research" },
    { title: "Tenant Protection Policy Index", publisher: "Urban Institute", url: "https://www.urban.org/", source_type: "nonprofit" },
    { title: "Affordable Housing Development Costs", publisher: "Government Accountability Office", url: "https://www.gao.gov/", source_type: "government" },
    { title: "Housing and Health Outcomes Study", publisher: "Robert Wood Johnson Foundation", url: "https://www.rwjf.org/", source_type: "nonprofit" },
    { title: "Lead Paint Remediation Costs", publisher: "HUD Healthy Homes Program", url: "https://www.hud.gov/program_offices/healthy_homes", source_type: "government" },
    { title: "Co-Living Market Analysis", publisher: "Urban Land Institute", url: "https://uli.org/", source_type: "research" },
    { title: "LIHTC Program Evaluation", publisher: "National Council of State Housing Agencies", url: "https://www.ncsha.org/", source_type: "nonprofit" },
    { title: "Housing Discrimination Testing Report", publisher: "National Fair Housing Alliance", url: "https://nationalfairhousing.org/", source_type: "nonprofit" },
    { title: "Construction Workforce Shortage Data", publisher: "Associated General Contractors", url: "https://www.agc.org/", source_type: "research" },
  ],
  health: [
    { title: "National Health Expenditure Projections", publisher: "Centers for Medicare & Medicaid Services", url: "https://www.cms.gov/", source_type: "government" },
    { title: "Opioid Overdose Death Statistics", publisher: "CDC National Center for Health Statistics", url: "https://www.cdc.gov/nchs/", source_type: "government" },
    { title: "Emergency Department Wait Time Analysis", publisher: "American College of Emergency Physicians", url: "https://www.acep.org/", source_type: "research" },
    { title: "Medicaid Expansion Outcomes Review", publisher: "Kaiser Family Foundation", url: "https://www.kff.org/", source_type: "nonprofit" },
    { title: "Community Health Worker Evidence Review", publisher: "American Public Health Association", url: "https://www.apha.org/", source_type: "research" },
    { title: "Drug Pricing International Comparison", publisher: "RAND Corporation", url: "https://www.rand.org/health-care.html", source_type: "research" },
    { title: "Maternal Mortality Disparities Report", publisher: "Commonwealth Fund", url: "https://www.commonwealthfund.org/", source_type: "nonprofit" },
    { title: "Telehealth Utilization Post-Pandemic", publisher: "Health Affairs", url: "https://www.healthaffairs.org/", source_type: "journal" },
    { title: "Mental Health Parity Compliance Report", publisher: "Department of Labor", url: "https://www.dol.gov/agencies/ebsa/about-ebsa/our-activities/resource-center/publications/compliance-assistance-guide-mhpaea", source_type: "government" },
    { title: "School-Based Health Center Outcomes", publisher: "School-Based Health Alliance", url: "https://www.sbh4all.org/", source_type: "nonprofit" },
    { title: "Social Determinants Screening Tools", publisher: "National Academy of Medicine", url: "https://nam.edu/", source_type: "research" },
    { title: "Public Health Infrastructure Assessment", publisher: "Trust for America's Health", url: "https://www.tfah.org/", source_type: "nonprofit" },
    { title: "Supervised Consumption Site Evidence", publisher: "The Lancet", url: "https://www.thelancet.com/", source_type: "journal" },
    { title: "Rural Hospital Closure Monitor", publisher: "Cecil G. Sheps Center UNC", url: "https://www.shepscenter.unc.edu/", source_type: "university" },
    { title: "Physician Workforce Projections", publisher: "Association of American Medical Colleges", url: "https://www.aamc.org/", source_type: "research" },
    { title: "Lead Exposure Health Costs Analysis", publisher: "Pediatrics Journal", url: "https://pediatrics.aappublications.org/", source_type: "journal" },
    { title: "Collaborative Care Model Meta-Analysis", publisher: "Archives of General Psychiatry", url: "https://jamanetwork.com/journals/jamapsychiatry", source_type: "journal" },
    { title: "Food is Medicine Evidence Review", publisher: "Center for Health Law and Policy Innovation", url: "https://chlpi.org/", source_type: "university" },
    { title: "Vaccine Equity Distribution Analysis", publisher: "Johns Hopkins Bloomberg School", url: "https://publichealth.jhu.edu/", source_type: "university" },
    { title: "Air Quality and Mortality Study", publisher: "Environmental Protection Agency", url: "https://www.epa.gov/", source_type: "government" },
    { title: "Adult Dental Coverage Impact Study", publisher: "Health Policy Institute ADA", url: "https://www.ada.org/resources/research/health-policy-institute", source_type: "research" },
    { title: "Chronic Disease Prevention ROI", publisher: "CDC Division of Chronic Disease Prevention", url: "https://www.cdc.gov/chronic-disease/", source_type: "government" },
    { title: "Behavioral Health Integration Models", publisher: "Milbank Memorial Fund", url: "https://www.milbank.org/", source_type: "nonprofit" },
    { title: "Health Insurance Coverage Trends", publisher: "Census Bureau Current Population Survey", url: "https://www.census.gov/programs-surveys/cps.html", source_type: "government" },
    { title: "Hospital Readmission Reduction Analysis", publisher: "Agency for Healthcare Research and Quality", url: "https://www.ahrq.gov/", source_type: "government" },
    { title: "Substance Use Treatment Capacity Study", publisher: "SAMHSA National Survey", url: "https://www.samhsa.gov/", source_type: "government" },
    { title: "Primary Care Access Disparities", publisher: "Robert Wood Johnson Foundation", url: "https://www.rwjf.org/", source_type: "nonprofit" },
    { title: "Precision Medicine Equity Concerns", publisher: "National Institutes of Health", url: "https://www.nih.gov/", source_type: "government" },
    { title: "Nursing Workforce Supply Analysis", publisher: "National Council of State Boards of Nursing", url: "https://www.ncsbn.org/", source_type: "research" },
    { title: "Climate Change and Health Impacts", publisher: "World Health Organization", url: "https://www.who.int/", source_type: "government" },
  ],
};

function randomPick<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function minutesAgo(mins: number): string {
  return new Date(Date.now() - mins * 60_000).toISOString();
}

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

function generateMessageContent(topic: string, round: number, lane: string): string {
  const roundContents: Record<number, Record<string, string[]>> = {
    1: { // Define
      proposal: [
        `The core challenge here is framing this correctly. When we talk about "${topic}", we need to distinguish between the symptoms the public sees and the structural causes policy can address. I propose we define the problem scope as: who is most affected, what current interventions exist, and where the evidence gaps are.`,
        `Let me ground us in the data first. The available research on this topic points to three key dimensions we need to address: access, quality, and sustainability. Each has distinct stakeholders and evidence bases.`,
      ],
      support: [
        `I want to add a historical perspective here. We've seen similar policy debates before, and the patterns are instructive. The precedents suggest that solutions work best when they account for implementation capacity at the local level.`,
        `Building on that framing, the equity dimension is critical. Any solution we consider must address differential impacts across income levels, geography, and race. The evidence clearly shows disparate outcomes in this area.`,
      ],
      counter: [
        `I appreciate the framing, but I think we're missing the cost dimension. Before we go further, we need to establish what resources are realistically available and what the opportunity costs are. This helps us avoid proposing solutions that can't be funded.`,
        `I'd push back slightly on the scope. We risk trying to solve everything at once. The evidence for narrower, targeted interventions is often stronger than comprehensive approaches. Can we identify the highest-leverage point?`,
      ],
    },
    2: { // Propose
      proposal: [
        `Based on our problem definition, I propose a three-tier approach: immediate relief measures that can launch within 90 days, medium-term structural changes requiring legislation, and long-term systems redesign. For the immediate tier, the evidence supports direct funding to existing community organizations.`,
        `My primary recommendation is a pilot program approach. Select 3-5 diverse jurisdictions, implement the intervention with proper controls, measure for 18 months, then scale what works. The research literature strongly favors this over national rollouts.`,
      ],
      support: [
        `The pilot approach aligns well with successful precedents. When similar programs were tested at scale, the ones that started with pilots showed significantly better outcomes during national implementation. The key success factor was allowing for local adaptation.`,
        `I support this direction and want to add the implementation blueprint. Based on comparable program rollouts, we need dedicated staff for each pilot site, a standardized data collection framework, and quarterly reviews with authority to course-correct.`,
      ],
      counter: [
        `The pilot model has merit, but 18 months is too long given the urgency. I'd propose an accelerated timeline with 6-month checkpoints and clear go/no-go criteria. We also need to address: what happens to the communities not selected for pilots?`,
        `I want to flag a risk with the phased approach: it can become an excuse for delay. The evidence shows that in similar contexts, communities that received immediate broad intervention actually outperformed those that waited for pilot results.`,
      ],
    },
    3: { // Stress test
      proposal: [
        `Let me stress-test our proposal against three failure scenarios: funding cuts after year one, political leadership changes, and community opposition. For each, I've identified mitigation strategies based on how similar programs survived these challenges.`,
        `The fiscal analysis shows this proposal costs between the two relevant benchmarks. Per-person costs are within range of programs that have demonstrated positive ROI within 3 years. The break-even point depends on which outcomes we measure.`,
      ],
      support: [
        `One underexplored risk is workforce capacity. Even with funding, do we have enough qualified people to implement this? The evidence from similar expansions suggests we need a parallel workforce pipeline or we'll face quality problems.`,
        `I want to validate the cost estimates by comparing to three analogous programs. The data suggests our projections are realistic if we account for regional variation. Implementation costs tend to run 15-20% over initial estimates.`,
      ],
      counter: [
        `There's a systemic risk we haven't discussed: if this succeeds in pilot sites, can the systems handle 50x scale? Most policy failures happen at the scaling stage, not the pilot stage. I'd recommend building scaling capacity from day one.`,
        `The political risk is real and probably underweighted. Similar initiatives have been defunded or redirected after elections. The mitigation should include building bipartisan support structures and embedding the program in existing institutions that survive political transitions.`,
      ],
    },
    4: { // Converge
      proposal: [
        `Synthesizing our discussion, I see convergence on these points: the pilot approach with accelerated 6-month checkpoints, parallel workforce development, built-in scaling plans, and political durability through institutional embedding. The remaining disagreement is on timeline intensity.`,
        `The group has effectively narrowed our options from five to two viable paths. Both have evidence support. I recommend Path A because it addresses the urgency concern while maintaining rigor. Path B is the fallback if initial funding targets aren't met.`,
      ],
      support: [
        `I can support this synthesis. The compromise on timeline addresses my urgency concern while keeping the evidence rigor intact. I'd add one condition: we need a clear public dashboard showing progress metrics so stakeholders can see results in real time.`,
        `The convergence feels right. I want to document that we're choosing deliberate trade-offs: speed over comprehensiveness in the first phase, with a commitment to broadening scope in phase two based on pilot data.`,
      ],
      counter: [
        `I'll support the consensus with one important caveat: we must define failure criteria upfront. If the pilot doesn't hit minimum thresholds by month 6, we need an honest reassessment rather than doubling down. The evidence from other programs shows early failure signals are reliable.`,
        `Agreed on the direction. My final concern is measurement. We need to agree now on which metrics constitute success, and they need to be outcomes not outputs. Counting activities doesn't tell us if lives improved.`,
      ],
    },
    5: { // Implementation
      proposal: [
        `Here's the implementation roadmap: Days 1-30: site selection and partner agreements. Days 31-60: staff hiring and training. Days 61-90: soft launch with first cohort. Month 4-6: full operation with data collection. Month 7: first evaluation checkpoint with go/no-go decision.`,
        `For the governance structure, I recommend a steering committee with representation from affected communities, implementing agencies, funders, and independent evaluators. Monthly meetings with published minutes and quarterly public reports.`,
      ],
      support: [
        `The staffing plan needs one addition: each site needs a dedicated data coordinator from day one. Programs that treated data as an afterthought consistently produced weaker evidence, which undermined scaling arguments later.`,
        `I'll draft the KPIs based on our convergence discussion. Primary outcomes: three measurable improvements within 12 months. Secondary outcomes: five system-level changes within 24 months. All with baseline measurements taken before launch.`,
      ],
      counter: [
        `The timeline is tight but feasible if we pre-identify backup sites. The biggest implementation risk is site-level delays. Having pre-approved alternates means we don't lose months if one site falls through.`,
        `Final implementation note: we need an explicit communications plan. The evidence shows that programs with proactive public communication build more durable political support. Budget at least 5% for communications and community engagement.`,
      ],
    },
  };

  const options = roundContents[round]?.[lane] || [`Discussion continues on this topic regarding ${topic}. The agents are analyzing evidence and building toward a practical recommendation.`];
  return options[Math.floor(Math.random() * options.length)];
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if already seeded
    const { data: statusData } = await supabase
      .from("system_status")
      .select("seed_version")
      .limit(1)
      .single();

    if (statusData?.seed_version === SEED_VERSION) {
      return new Response(JSON.stringify({ message: "Already seeded", version: SEED_VERSION }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const log: string[] = [];
    let sourcesCreated = 0;
    let missionsCreated = 0;
    let messagesCreated = 0;
    let claimsCreated = 0;
    let citationsCreated = 0;

    // 1. Seed sources
    const sourceIdsByBucket: Record<string, string[]> = {};
    for (const [bucket, sources] of Object.entries(SOURCES_BY_BUCKET)) {
      const bucketId = BUCKET_IDS[bucket];
      // Create or find source pack
      let packId: string;
      const { data: existingPack } = await supabase
        .from("source_packs")
        .select("id")
        .eq("bucket_id", bucketId)
        .limit(1)
        .maybeSingle();

      if (existingPack) {
        packId = existingPack.id;
      } else {
        const { data: newPack } = await supabase
          .from("source_packs")
          .insert({ bucket_id: bucketId, name: `${bucket.charAt(0).toUpperCase() + bucket.slice(1)} Research Library`, description: `Curated research sources for ${bucket} policy debates` })
          .select("id")
          .single();
        packId = newPack!.id;
      }

      sourceIdsByBucket[bucket] = [];
      for (const src of sources) {
        const { data: sourceRow } = await supabase
          .from("sources")
          .insert({
            source_pack_id: packId,
            title: src.title,
            url: src.url,
            source_type: src.source_type,
            metadata: { publisher: src.publisher },
          })
          .select("id")
          .single();
        if (sourceRow) {
          sourceIdsByBucket[bucket].push(sourceRow.id);
          sourcesCreated++;
        }
      }
    }
    log.push(`Sources created: ${sourcesCreated}`);

    // 2. Seed missions with messages, claims, citations
    const claimTypes = ["evidence", "precedent", "assumption", "speculation"] as const;
    const bucketKeys = Object.keys(BUCKET_IDS);

    for (const bucket of bucketKeys) {
      const topics = MISSION_TOPICS[bucket];
      const bucketId = BUCKET_IDS[bucket];
      const sourceIds = sourceIdsByBucket[bucket] || [];

      for (let i = 0; i < topics.length; i++) {
        const topic = topics[i];
        // Status distribution: first 4 = live, next 6 = completed recently, rest = completed older
        let status: string;
        let isLive: boolean;
        let createdDaysAgo: number;
        let lastActivityMinsAgo: number;

        if (i < 4) {
          // LIVE missions
          status = "live";
          isLive = true;
          createdDaysAgo = Math.floor(Math.random() * 3) + 1;
          lastActivityMinsAgo = Math.floor(Math.random() * 10) + 1; // 1-10 mins ago
        } else if (i < 10) {
          // Recently completed
          status = "completed";
          isLive = false;
          createdDaysAgo = Math.floor(Math.random() * 7) + 3;
          lastActivityMinsAgo = Math.floor(Math.random() * 1440) + 60; // 1h-24h ago
        } else {
          // Older completed
          status = "completed";
          isLive = false;
          createdDaysAgo = Math.floor(Math.random() * 20) + 7;
          lastActivityMinsAgo = Math.floor(Math.random() * 10080) + 1440; // 1d-7d ago
        }

        const missionCreatedAt = daysAgo(createdDaysAgo);
        const { data: mission } = await supabase
          .from("missions")
          .insert({
            bucket_id: bucketId,
            title: topic.title,
            core_question: topic.question,
            debate_hook: topic.hook,
            status: status as any,
            is_live: isLive,
            created_at: missionCreatedAt,
            started_at: missionCreatedAt,
            completed_at: status === "completed" ? minutesAgo(lastActivityMinsAgo) : null,
            success_metric: "Actionable recommendation with evidence support and implementation plan",
          })
          .select("id")
          .single();

        if (!mission) continue;
        missionsCreated++;

        // Generate messages for all 5 rounds
        const totalRounds = status === "live" ? Math.floor(Math.random() * 3) + 1 : 5;
        const missionMessageIds: string[] = [];
        const missionSourceIds = randomPick(sourceIds, Math.min(15, sourceIds.length));

        for (let round = 1; round <= totalRounds; round++) {
          const messagesPerRound = Math.floor(Math.random() * 3) + 4; // 4-6
          const roundAgents = randomPick(AGENT_IDS, messagesPerRound);

          for (let m = 0; m < messagesPerRound; m++) {
            const lane = LANES[m % 3];
            // Time spacing: earlier rounds have older timestamps
            const msgMinsAgo = round === totalRounds && m === messagesPerRound - 1
              ? lastActivityMinsAgo
              : lastActivityMinsAgo + (totalRounds - round) * 120 + (messagesPerRound - m) * 15;

            const content = generateMessageContent(topic.title, round, lane);

            const { data: msg } = await supabase
              .from("debate_messages")
              .insert({
                mission_id: mission.id,
                agent_id: roundAgents[m],
                round_number: round,
                lane: lane as any,
                content,
                created_at: minutesAgo(msgMinsAgo),
              })
              .select("id")
              .single();

            if (msg) {
              missionMessageIds.push(msg.id);
              messagesCreated++;
            }
          }
        }

        // Generate claims (10-15 per mission)
        const claimCount = Math.floor(Math.random() * 6) + 10;
        const claimMessageIds = randomPick(missionMessageIds, Math.min(claimCount, missionMessageIds.length));

        for (let c = 0; c < claimCount && c < claimMessageIds.length; c++) {
          const claimType = claimTypes[Math.floor(Math.random() * claimTypes.length)];
          const confidence = claimType === "evidence" ? 70 + Math.floor(Math.random() * 25)
            : claimType === "precedent" ? 60 + Math.floor(Math.random() * 30)
            : claimType === "assumption" ? 40 + Math.floor(Math.random() * 30)
            : 20 + Math.floor(Math.random() * 30);

          const { data: claim } = await supabase
            .from("claims")
            .insert({
              mission_id: mission.id,
              message_id: claimMessageIds[c],
              claim_text: `Evidence-based observation regarding ${topic.title.toLowerCase()} derived from policy research and field data.`,
              claim_type: claimType as any,
              confidence,
              is_flagged: Math.random() < 0.05,
            })
            .select("id")
            .single();

          if (claim) {
            claimsCreated++;
            // Attach citation to ~65% of claims
            if (Math.random() < 0.65 && missionSourceIds.length > 0) {
              const srcId = missionSourceIds[Math.floor(Math.random() * missionSourceIds.length)];
              await supabase.from("citations").insert({
                claim_id: claim.id,
                source_id: srcId,
                snippet: "Supporting evidence from peer-reviewed research and public data.",
                why_it_matters: "This finding provides empirical grounding for the claim and strengthens the overall evidence base.",
              });
              citationsCreated++;
            }
          }
        }

        // Scores for all missions
        const evidenceScore = Math.floor(Math.random() * 25) + 55;
        const actionabilityScore = Math.floor(Math.random() * 30) + 50;
        const riskScore = Math.floor(Math.random() * 30) + 30;
        const clarityScore = Math.floor(Math.random() * 20) + 65;
        const citationCoverage = Math.floor(Math.random() * 25) + 55;

        await supabase.from("scores").upsert({
          mission_id: mission.id,
          evidence_score: evidenceScore,
          actionability_score: actionabilityScore,
          risk_score: riskScore,
          clarity_score: clarityScore,
          overall_score: Math.floor((evidenceScore + actionabilityScore + clarityScore) / 3),
          citation_coverage: citationCoverage,
          flagged_claim_rate: Math.floor(Math.random() * 8),
          revision_count: Math.floor(Math.random() * 3),
        }, { onConflict: "mission_id" });

        // Solution cards for completed missions
        if (status === "completed") {
          await supabase.from("solution_cards").insert({
            mission_id: mission.id,
            title: `Recommended approach for ${topic.title.toLowerCase()}`,
            summary: `A phased implementation strategy addressing ${topic.question.toLowerCase()} Based on evidence from multiple policy research sources and field data.`,
            content: `This solution recommends a targeted pilot program in 3-5 jurisdictions, followed by evaluation and scaled deployment. Key elements include stakeholder engagement, data-driven decision points, and built-in course correction mechanisms.`,
            intended_owner: "Local and state government agencies",
            timeline: `${6 + Math.floor(Math.random() * 18)} months for pilot, 2-3 years for full scale`,
            cost_band: ["$500K-$2M", "$2M-$10M", "$10M-$50M"][Math.floor(Math.random() * 3)],
            staffing_assumptions: `${2 + Math.floor(Math.random() * 8)} FTE for pilot phase`,
            risks_mitigations: "Primary risks include political transitions and funding continuity. Mitigations include bipartisan advisory board and multi-year funding commitments.",
            success_metrics: JSON.stringify([
              "Measurable improvement in target outcomes within 12 months",
              "Stakeholder satisfaction above 70%",
              "Cost per outcome within benchmark range",
              "Scalability assessment positive by month 18",
            ]),
            is_published: true,
            decision_summary: `After comprehensive debate analysis, the panel recommends a phased approach to ${topic.title.toLowerCase()} with emphasis on evidence-based interventions and local adaptation.`,
            why_this_over_alternatives: "This approach balances urgency with rigor, allows for local context, and builds the evidence base needed for sustainable scaling.",
            implementation_steps: JSON.stringify([
              "Identify and engage pilot jurisdictions",
              "Establish baseline measurements",
              "Hire and train implementation team",
              "Launch pilot with 6-month checkpoints",
              "Conduct independent evaluation",
              "Scale based on results",
            ]),
            first_30_days_plan: "Site selection, partner MOUs, hiring plan, baseline data collection, communications launch.",
          });
        }

        // Debate stats
        await supabase.from("debate_stats").upsert({
          mission_id: mission.id,
          last_message_at: minutesAgo(lastActivityMinsAgo),
          messages_last_hour: isLive ? Math.floor(Math.random() * 12) + 4 : 0,
          claims_count: claimCount,
          citation_coverage: Math.floor(citationsCreated / Math.max(claimsCreated, 1) * 100),
        }, { onConflict: "mission_id" });
      }
    }

    log.push(`Missions created: ${missionsCreated}`);
    log.push(`Messages created: ${messagesCreated}`);
    log.push(`Claims created: ${claimsCreated}`);
    log.push(`Citations created: ${citationsCreated}`);

    // 3. Update system_status
    await supabase.from("system_status").update({
      debates_live: 16,
      messages_last_10_min: Math.floor(Math.random() * 20) + 10,
      citation_coverage_24h: 65,
      generation_enabled: true,
      budget_state: "ok",
      last_updated: new Date().toISOString(),
      seed_version: SEED_VERSION,
      seeded_at: new Date().toISOString(),
    }).not("id", "is", null);

    return new Response(JSON.stringify({ success: true, version: SEED_VERSION, log }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Seed error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
