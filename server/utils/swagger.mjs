import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Book Collection APIs",
      version: "1.0.0",
      description: "API สำหรับแอพพลิเคชั่นเพื่อจัดการ คอลเลกชันหนังสือ",
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
      contact: {
        name: "Martin",
        url: "https://yourwebsite.com",
        email: "tinnaphop.t@st.econ.tu.ac.th",
      },
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Development server"
      }
    ],
  },
  apis: ["./apps/*.mjs"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;