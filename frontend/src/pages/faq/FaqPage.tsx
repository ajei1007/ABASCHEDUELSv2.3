import React, { useDeferredValue, useMemo, useState } from "react";
import { 
  Accordion, AccordionSummary, AccordionDetails, Typography, 
  Container, Stack, 
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { faqData } from "../faq/faqData";
import LazyYouTubeEmbed from "../../components/LazyYouTubeEmbed/LazyYouTubeEmbed"; 
import CustomInput from '../../components/CustomInputModal/CustomInput';

// Function to parse and render bold text in answers
const formatTextWithBold = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g); // Splits text by **bold markers**
  return parts.map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      (<strong key={index}>{part.slice(2, -2)}</strong>) // Renders bold text
    ) : (
      part
    )
  );
};

const FaqViewPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  // Delays filtering for responsive search bar
  const deferredSearchTerm = useDeferredValue(searchTerm);

  // Handle search bar change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setExpanded(null); // Close all accordions when search changes
  };

  // Search bar filtering logic
  const filteredFAQs = useMemo(() => {
    if (!deferredSearchTerm) return faqData;

    const lowerCaseSearchTerm = deferredSearchTerm.toLowerCase();

    return faqData.filter(faq =>
      faq.question.toLowerCase().includes(lowerCaseSearchTerm) ||
      faq.answer.some(step => step.toLowerCase().includes(lowerCaseSearchTerm))
    );
  }, [deferredSearchTerm]);

  // Clear search query
  const handleClearSearch = () => {
    setSearchTerm(""); // Clear search bar
    setExpanded(null); // Reset expanded accordion
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Frequently Asked Questions
      </Typography>

      {/* Search Bar */}
      <Stack sx={{ mb: 3 }}>
        <CustomInput
          type="text"
          name="filterValue"
          label="Search FAQs"
          id="filterValue"
          value={searchTerm}
          onChange={handleSearchChange}
          clearable
          onClear={handleClearSearch}
        />
      </Stack>

      {/* Render Filtered FAQs */}
      <Stack spacing={2} marginTop={2}>
        {filteredFAQs.length > 0 ? (
          filteredFAQs.map((faq, index) => (
            <Accordion 
              key={index}
              className="accordion-item"
              expanded={expanded === index}
              onChange={() => setExpanded(expanded === index ? null : index)}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel-content"
                id={`panel-header-${index}`}
                sx={{
                  transition: "box-shadow 0.3s ease-in-out, border-radius 0.3s ease-in-out",
                  borderRadius: expanded === index ? "0.5rem 0.5rem 0px 0px" : "0.5rem",
                  backgroundColor: "white",
                  boxShadow: expanded === index ? "none" : "0px 4px 10px rgba(0, 0, 0, 0.08)", 
                }}
              >
                <Typography
                  component='span'
                  style={{
                        fontWeight: '600',
                        fontSize: '1.45rem',
                        color: '#474747',
                      }}
                  >
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails className="accordion-item-details" sx={{ backgroundColor: "#FFF", padding: "1rem" }}>
                {faq.answer.map((step: string, stepIndex: number) => (
                  <Typography 
                    key={stepIndex} 
                    sx={{ mb: 3, fontSize: "1.25rem", lineHeight: 1.6 }}
                  >
                    {formatTextWithBold(step)}
                  </Typography>
                ))}


                {/* Lazy Load YouTube Videos Only When Expanded */}
                {faq.videoUrl && expanded === index && <LazyYouTubeEmbed videoUrl={faq.videoUrl} />}
              </AccordionDetails>
            </Accordion>
          ))
          ) : (
          <Typography variant="body1" align="center" sx={{ mt: 2 }}>
            No FAQs found matching your search.
          </Typography>
        )}
      </Stack>
    </Container>
  );
};

export default FaqViewPage;
