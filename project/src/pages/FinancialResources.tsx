import React from "react";
import { DollarSign, FileText, ExternalLink } from "lucide-react";

const FinancialResources = () => {
  const resources = [
    {
      category: "Government Assistance",
      items: [
        {
          title: "Ayushman Bharat (PMJAY)",
          description:
            "Free health insurance up to ₹5 lakh for secondary and tertiary care hospitalization.",
          link: "https://pmjay.gov.in/",
        },
        {
          title: "Atal Pension Yojana",
          description:
            "Government-backed pension scheme providing guaranteed pension between ₹1,000 to ₹5,000.",
          link: "https://www.npscra.nsdl.co.in/atal-pension-yojana.php",
        },
        {
          title: "National Social Assistance Programme",
          description:
            "Financial assistance for elderly, widows, and persons with disabilities.",
          link: "https://nsap.nic.in/",
        },
        {
          title: "Pradhan Mantri Suraksha Bima Yojana",
          description:
            "Accident insurance scheme offering ₹2 lakh coverage at just ₹20 per year.",
          link: "https://www.jansuraksha.gov.in/",
        },
      ],
    },
    {
      category: "Grants & Financial Aid",
      items: [
        {
          title: "PM CARES Fund",
          description:
            "Financial support for those affected by emergency or distress situations.",
          link: "https://www.pmcares.gov.in/en/",
        },
        {
          title: "Senior Citizen Savings Scheme",
          description:
            "Government-backed savings scheme for senior citizens aged 60+ with attractive interest rates.",
          link: "https://www.india.gov.in/spotlight/senior-citizens-savings-scheme",
        },
        {
          title: "Deendayal Disabled Rehabilitation Scheme",
          description:
            "Grants for organizations working for welfare of persons with disabilities.",
          link: "https://disabilityaffairs.gov.in/content/page/ddrs.php",
        },
        {
          title: "State Disability Pension Schemes",
          description:
            "Monthly financial assistance for persons with disabilities (varies by state).",
          link: "https://disabilityaffairs.gov.in/content/page/state-wise-pension.php",
        },
      ],
    },
    {
      category: "Tax Benefits",
      items: [
        {
          title: "Section 80D - Medical Insurance Deduction",
          description:
            "Tax deduction up to ₹25,000 for health insurance (₹50,000 for senior citizens).",
          link: "https://www.incometax.gov.in/iec/faq/topic/1544/deductions/section-80d",
        },
        {
          title: "Section 80DD - Disability Care Deduction",
          description:
            "Deduction of ₹75,000 (₹1.25 lakh for severe disability) for care of dependent with disability.",
          link: "https://www.incometax.gov.in/iec/faq/topic/1547/deductions/section-80dd",
        },
        {
          title: "Section 80DDB - Medical Treatment Deduction",
          description:
            "Deduction up to ₹40,000 (₹1 lakh for senior citizens) for specified diseases.",
          link: "https://www.incometax.gov.in/iec/faq/topic/1548/deductions/section-80ddb",
        },
        {
          title: "Section 80U - Self Disability Deduction",
          description:
            "Tax deduction of ₹75,000 for persons with disability (₹1.25 lakh for severe disability).",
          link: "https://www.incometax.gov.in/iec/faq/topic/1565/deductions/section-80u",
        },
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <DollarSign className="h-8 w-8 text-primary-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">
            Financial Resources
          </h1>
        </div>

        <div className="mb-8">
          <div className="bg-primary-50 border-l-4 border-primary-600 p-4 rounded">
            <h2 className="text-lg font-semibold text-primary-900 mb-2">
              Financial Support Overview
            </h2>
            <p className="text-primary-800">
              Explore various financial resources and support programs available
              to caretakers. These resources can help manage healthcare costs,
              daily expenses, and long-term care planning.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {resources.map((section, index) => (
            <div key={index}>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FileText className="h-5 w-5 text-primary-600 mr-2" />
                {section.category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-medium text-lg mb-2">{item.title}</h3>
                    <p className="text-gray-600 mb-3">{item.description}</p>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary-600 hover:text-primary-700"
                    >
                      Learn More
                      <ExternalLink className="h-4 w-4 ml-1" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Need Financial Advice?</h2>
          <p className="text-gray-600 mb-4">
            Connect with our financial advisors who specialize in caretaker
            financial planning and support.
          </p>
          <button className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition-colors">
            Schedule Consultation
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinancialResources;
