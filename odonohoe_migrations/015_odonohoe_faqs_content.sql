-- Migration: Populate O'Donohoe FAQs content
-- Phase 6: Database-driven FAQ content with template variables
-- Client ID: 54479ee2-bc32-423e-865b-210572e8a0b0
-- DO NOT APPLY - Migration file only

UPDATE client_websites
SET faqs = '{
  "categories": [
    {
      "id": "general",
      "name": "General Questions",
      "icon": "HelpCircle",
      "items": [
        {
          "question": "How long has {agencyName} been in business?",
          "answer": "{agencyName} has been serving {city} and the {regionalDescriptor} since {foundingYear}. For {yearsInBusiness}, we''ve provided personalized insurance solutions to generations of families and businesses in our community."
        },
        {
          "question": "Are you an independent insurance agency?",
          "answer": "Yes, we are an independent insurance agency. This means we represent multiple insurance carriers rather than just one company. This allows us to offer you more choices and help you find the best coverage at the most competitive rates."
        },
        {
          "question": "How do I get a quote from {agencyName}?",
          "answer": "You can request a quote by calling our office at {phone}, visiting our office in person, or using our online quote request form. Our team will gather the necessary information and provide you with personalized coverage options."
        },
        {
          "question": "Do you offer insurance throughout {state} or just in {city}?",
          "answer": "While our primary service area is {city} and the surrounding coastal communities, we offer insurance solutions throughout {state}. Our expertise in coastal insurance is particularly valuable for property owners along the {regionalDescriptor}."
        }
      ]
    },
    {
      "id": "home",
      "name": "Home Insurance",
      "icon": "Home",
      "items": [
        {
          "question": "What does homeowners insurance typically cover?",
          "answer": "A standard homeowners insurance policy typically covers damage to your home''s structure, personal belongings, liability protection, and additional living expenses if you need to temporarily relocate due to covered damage. However, specific coverage can vary by policy and carrier."
        },
        {
          "question": "Is flood insurance included in homeowners insurance?",
          "answer": "No, flood insurance is not typically included in standard homeowners policies. For properties in {city} and other coastal areas, we strongly recommend purchasing a separate flood insurance policy through the National Flood Insurance Program (NFIP) or private flood insurance carriers."
        },
        {
          "question": "How can I lower my homeowners insurance premium?",
          "answer": "There are several ways to potentially lower your premium, including: bundling home and auto insurance, installing security systems or storm shutters, raising your deductible, improving your credit score, and making sure you''re receiving all applicable discounts. Our agents can review your specific situation and recommend appropriate savings opportunities."
        },
        {
          "question": "Do I need special insurance for a coastal property in {city}?",
          "answer": "Coastal properties often have unique insurance considerations due to their exposure to hurricanes, storm surge, and other weather events. While you may not need \"special\" insurance, you will likely need a carefully structured policy that may include windstorm insurance through the {state} Windstorm Insurance Association (TWIA) in addition to standard homeowners coverage and flood insurance."
        }
      ]
    },
    {
      "id": "auto",
      "name": "Auto Insurance",
      "icon": "Car",
      "items": [
        {
          "question": "What auto insurance coverage is required in {state}?",
          "answer": "{state} law requires drivers to have at least the following minimum liability coverage: $30,000 for bodily injury liability per person, $60,000 for bodily injury liability per accident, and $25,000 for property damage liability per accident (30/60/25). However, we typically recommend higher limits to better protect your assets."
        },
        {
          "question": "How does my credit score affect my auto insurance rates?",
          "answer": "In {state}, insurance companies can use your credit score as one of several factors to determine your premium. Generally, a higher credit score may lead to lower rates, while a lower score might result in higher premiums. However, this is just one of many factors considered, including your driving record, claims history, and vehicle type."
        },
        {
          "question": "Does auto insurance cover rental cars?",
          "answer": "Your personal auto insurance policy may provide some coverage for rental cars, but the extent of coverage can vary. Some policies include rental car coverage, while others may require additional riders or endorsements. We recommend checking your specific policy details before renting a vehicle or considering supplemental coverage offered by the rental company."
        },
        {
          "question": "Do I need special insurance if I use my car for business purposes?",
          "answer": "Yes, if you use your personal vehicle for business purposes beyond commuting to and from work, you may need additional coverage. Personal auto policies typically exclude business use, so it''s important to disclose how you use your vehicle to ensure you have appropriate coverage."
        }
      ]
    },
    {
      "id": "business",
      "name": "Business Insurance",
      "icon": "Building",
      "items": [
        {
          "question": "What types of business insurance do you offer?",
          "answer": "We offer a comprehensive range of business insurance solutions, including: General Liability Insurance, Business Property Insurance, Professional Liability/Errors & Omissions, Workers'' Compensation, Business Interruption Insurance, Commercial Auto Insurance, Cyber Liability Insurance, and customized packages for specific industries. We can tailor coverage to meet your business''s unique needs."
        },
        {
          "question": "How much does business insurance cost?",
          "answer": "Business insurance costs vary widely depending on factors such as your industry, business size, location, coverage types and limits, claims history, and risk factors specific to your operations. As an independent agency, we can shop multiple carriers to help you find the right balance of coverage and affordability."
        },
        {
          "question": "What is Business Interruption insurance and do I need it?",
          "answer": "Business Interruption insurance helps replace lost income and covers operating expenses if your business is temporarily unable to operate due to a covered peril (such as fire, windstorm, or certain other disasters). For {city} businesses, especially those in coastal areas vulnerable to hurricanes and flooding, this coverage can be vital. We recommend it for most businesses that would suffer significant financial hardship from an extended closure."
        }
      ]
    },
    {
      "id": "claims",
      "name": "Claims & Policy Management",
      "icon": "FileText",
      "items": [
        {
          "question": "How do I file an insurance claim?",
          "answer": "To file a claim, contact our office at {phone} as soon as possible after the incident. Our team will guide you through the process, help you gather the necessary documentation, and serve as your advocate with the insurance company. You can also report claims directly to your insurance carrier using their claims hotline or online portal, but we recommend notifying us as well so we can help ensure your claim is handled properly."
        },
        {
          "question": "How long does it take to process a claim?",
          "answer": "Claim processing times vary depending on the type and complexity of the claim, the extent of damage or injuries, the responsiveness of all parties involved, and other factors. Simple auto claims might be resolved in a few days, while complex property claims could take weeks or months. Throughout the process, we''ll keep you informed of your claim''s status and work to expedite resolution whenever possible."
        },
        {
          "question": "Will my insurance rates increase if I file a claim?",
          "answer": "Not all claims lead to rate increases. Whether your rates increase depends on the type of claim, your prior claims history, your insurance carrier''s policies, and other factors. Generally, liability claims where you are at fault or multiple claims within a short period are more likely to affect your rates than a single claim for damage that was clearly beyond your control."
        }
      ]
    }
  ]
}'::jsonb
WHERE client_id = '54479ee2-bc32-423e-865b-210572e8a0b0';
