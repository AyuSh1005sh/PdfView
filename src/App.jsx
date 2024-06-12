import React, { useState, useEffect } from 'react';
import {
  ChakraProvider,
  extendTheme,
  Box,
  Text,
  Heading,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button
} from '@chakra-ui/react';
import { Card, CardBody, CardHeader, CardFooter } from '@chakra-ui/react';
import { Document, Page, pdfjs } from 'react-pdf';
import './App.css';
import "react-pdf/dist/esm/Page/TextLayer.css";

const theme = extendTheme({
  components: {
    Button,
  },
});

function App() {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  const [pdfData, setPdfData] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // Track the current page
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [pageDimensions, setPageDimensions] = useState({ width: 0, height: 0 });

  const onFileChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      setPdfData(e.target.result);
    };

    reader.readAsDataURL(file);
    setCurrentPage(1);
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const goToPreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(1, prevPage - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prevPage) => Math.min(numPages, prevPage + 1));
  };

  useEffect(() => {
    const updatePageDimensions = () => {
      const modalContent = document.querySelector('.chakra-modal__content');
      if (modalContent) {
        const modalWidth = modalContent.clientWidth;
        const modalHeight = modalContent.clientHeight;
        const aspectRatio = 8.5 / 11; // US Letter aspect ratio

        let width = modalWidth * 0.9; // 90% of modal width
        let height = width / aspectRatio; // Calculate height based on aspect ratio

        if (height > modalHeight * 0.9) {
          height = modalHeight * 0.9; // 90% of modal height
          width = height * aspectRatio; // Calculate width based on aspect ratio
        }

        setPageDimensions({ width, height });
      }
    };

    updatePageDimensions();
    window.addEventListener('resize', updatePageDimensions);

    return () => {
      window.removeEventListener('resize', updatePageDimensions);
    };
  }, [isOpen]);

  return (
    <ChakraProvider theme={theme}>
      <Box p={4} display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bg="gray.100">
        <Card align="center" maxW={{ base: "90%", sm: "400px" }} boxShadow="md" bg="white">
          <CardHeader>
            <Heading size="md">PDF VIEWER</Heading>
          </CardHeader>
          <CardBody>
            <Text>Upload to View</Text>
          </CardBody>
          <CardFooter>
            <input
              type="file"
              accept=".pdf"
              id="file-upload"
              style={{ display: 'none' }}
              onChange={onFileChange}
            />
            <label htmlFor="file-upload">
              <Button as="span" colorScheme="red" mr="6px">
                Upload
              </Button>
            </label>
            <Button colorScheme="blue" onClick={onOpen} isDisabled={!pdfData}>
              View
            </Button>
          </CardFooter>
        </Card>
      </Box>

      {pdfData && (
        <Modal isOpen={isOpen} onClose={onClose} size="full">
          <ModalOverlay />
          <ModalContent p="2" m="5rem auto" maxH="80%" maxW="80%" display="flex" flexDirection="column">
            <ModalHeader>PDF Document</ModalHeader>
            <ModalCloseButton />
            <ModalBody p="0" flex="1" display="flex" justifyContent="center" alignItems="center" overflow="auto">
              <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center',paddingTop: '20%' }}>
                <Document
                  file={pdfData}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading="Loading PDF..."
                  noData="No PDF file specified"
                  error="Failed to load PDF file."
                >
                  
                    <Page style={{ paddingTop: '25%' }}
                    pageNumber={currentPage}
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
                    width={pageDimensions.width}
                    height={pageDimensions.height}
                    />
                  
                </Document>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" onClick={goToPreviousPage} isDisabled={currentPage === 1}>
                Previous
              </Button>
              <Text mx="2">Page {currentPage} of {numPages}</Text>
              <Button colorScheme="blue" onClick={goToNextPage} isDisabled={currentPage === numPages}>
                Next
              </Button>
              <Button colorScheme="red" ml="auto" onClick={onClose}>
                Close
              </Button>
            </ModalFooter> 
          </ModalContent>
        </Modal>
      )}
    </ChakraProvider>
  );
}

export default App;
