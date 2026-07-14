'use client'

import BackButton from '@/components/BackButton'
import { motion } from 'framer-motion'
import {
  Container,
  Box,
  Typography,
} from '@mui/material'

const sections = [
  {
    title: 'Welcome to Recovery Co.',
    content: (
      <>
        <Typography variant="body1" sx={{ lineHeight: 1.7, textAlign: 'left' }}>
          By accessing or using our website, purchasing our products, or interacting with our services,
          you agree to be bound by these Terms of Service. Please read them carefully before using our
          website.
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.7, textAlign: 'left' }}>
          Recovery Co. is a South African wellness brand dedicated to creating thoughtfully formulated
          nutritional products for growing children. These Terms of Service govern your use of our
          website and the purchase of our products.
        </Typography>
      </>
    ),
  },
  {
    title: '1. Eligibility',
    content: (
      <Typography variant="body1" sx={{ lineHeight: 1.7, textAlign: 'left' }}>
        By using this website, you confirm that you are at least 18 years of age or are using the
        website under the supervision of a parent or legal guardian.
      </Typography>
    ),
  },
  {
    title: '2. Product Information',
    content: (
      <>
        <Typography variant="body1" sx={{ lineHeight: 1.7, textAlign: 'left' }}>
          We strive to ensure that all product descriptions, images, ingredient information, and
          pricing displayed on our website are accurate and up to date.
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.7, textAlign: 'left' }}>
          As our products are continuously reviewed and improved, product packaging, ingredients, and
          specifications may change from time to time. Please refer to the product packaging for the
          most current information.
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.7, textAlign: 'left' }}>
          Recovery Co. reserves the right to update product information without prior notice.
        </Typography>
      </>
    ),
  },
  {
    title: '3. Health Information',
    content: (
      <>
        <Typography variant="body1" sx={{ lineHeight: 1.7, textAlign: 'left' }}>
          Recovery Co. Super Sprinkle is a nutritional supplement intended to support everyday wellness
          as part of a balanced diet and healthy lifestyle.
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.7, textAlign: 'left' }}>
          The information provided on this website is for general informational purposes only and
          should not be considered medical advice or a substitute for consultation with a qualified
          healthcare professional.
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.7, textAlign: 'left' }}>
          Our products are not intended to diagnose, treat, cure, or prevent any disease.
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.7, textAlign: 'left' }}>
          If your child has an existing medical condition, is taking medication, or has known
          allergies, please consult a qualified healthcare professional before using our products.
        </Typography>
      </>
    ),
  },
  {
    title: '4. Orders',
    content: (
      <>
        <Typography variant="body1" sx={{ lineHeight: 1.7, textAlign: 'left' }}>
          All orders are subject to product availability and acceptance.
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.7, textAlign: 'left' }}>
          Once your order has been placed, you will receive an order confirmation via email. This
          confirmation does not constitute acceptance of your order. Recovery Co. reserves the right
          to refuse or cancel any order where necessary, including in cases of pricing errors,
          suspected fraud, or product unavailability.
        </Typography>
      </>
    ),
  },
  {
    title: '5. Pricing and Payment',
    content: (
      <>
        <Typography variant="body1" sx={{ lineHeight: 1.7, textAlign: 'left' }}>
          All prices displayed on our website are in South African Rand (ZAR) and include VAT where
          applicable.
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.7, textAlign: 'left' }}>
          Payment must be received in full before an order is processed and dispatched.
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.7, textAlign: 'left' }}>
          Recovery Co. reserves the right to amend pricing at any time without prior notice.
        </Typography>
      </>
    ),
  },
  {
    title: '6. Shipping and Delivery',
    content: (
      <>
        <Typography variant="body1" sx={{ lineHeight: 1.7, textAlign: 'left' }}>
          Recovery Co. delivers throughout South Africa.
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.7, textAlign: 'left' }}>
          Estimated delivery times are provided as a guide only and may vary due to courier
          operations, public holidays, weather conditions, or circumstances beyond our control.
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.7, textAlign: 'left' }}>
          Risk in the products passes to the customer upon delivery.
        </Typography>
      </>
    ),
  },
  {
    title: '7. Returns and Refunds',
    content: (
      <>
        <Typography variant="body1" sx={{ lineHeight: 1.7, textAlign: 'left' }}>
          Returns and refunds are handled in accordance with the Consumer Protection Act of South
          Africa.
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.7, textAlign: 'left' }}>
          If your order arrives damaged, defective, or incorrect, please contact us within 7 days of
          receiving your order.
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.7, textAlign: 'left' }}>
          For health and safety reasons, opened or used nutritional products cannot be returned unless
          required by law or where the product is defective.
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.7, textAlign: 'left' }}>
          Please refer to our Returns Policy for further information.
        </Typography>
      </>
    ),
  },
  {
    title: '8. Intellectual Property',
    content: (
      <Typography variant="body1" sx={{ lineHeight: 1.7, textAlign: 'left' }}>
        All content on this website, including text, graphics, logos, product names, packaging
        designs, photographs, and other materials, is the property of Recovery Co. or its licensors
        and is protected by applicable intellectual property laws. No content may be copied,
        reproduced, distributed, or used without prior written permission.
      </Typography>
    ),
  },
  {
    title: '9. Acceptable Use',
    content: (
      <>
        <Typography variant="body1" sx={{ lineHeight: 1.7, textAlign: 'left' }}>
          You agree not to:
        </Typography>
        <Box component="ul" sx={{ mt: 2, pl: 4, textAlign: 'left', '& li': { mb: 1 } }}>
          <Typography component="li" variant="body1">Use this website for any unlawful purpose.</Typography>
          <Typography component="li" variant="body1">
            Attempt to interfere with the operation or security of the website.
          </Typography>
          <Typography component="li" variant="body1">Upload malicious software or harmful code.</Typography>
          <Typography component="li" variant="body1">Misrepresent your identity or provide false information.</Typography>
          <Typography component="li" variant="body1">
            Infringe the intellectual property rights of Recovery Co. or others.
          </Typography>
        </Box>
      </>
    ),
  },
  {
    title: '10. Limitation of Liability',
    content: (
      <>
        <Typography variant="body1" sx={{ lineHeight: 1.7, textAlign: 'left' }}>
          To the fullest extent permitted by law, Recovery Co. shall not be liable for any indirect,
          incidental, consequential, or special damages arising from the use of this website or our
          products.
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.7, textAlign: 'left' }}>
          Nothing in these Terms excludes any rights that cannot legally be excluded under South
          African law.
        </Typography>
      </>
    ),
  },
  {
    title: '11. Privacy',
    content: (
      <>
        <Typography variant="body1" sx={{ lineHeight: 1.7, textAlign: 'left' }}>
          Your privacy is important to us.
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.7, textAlign: 'left' }}>
          Our collection and processing of personal information is governed by our Privacy Policy,
          which forms part of these Terms of Service.
        </Typography>
      </>
    ),
  },
  {
    title: '12. Changes to These Terms',
    content: (
      <>
        <Typography variant="body1" sx={{ lineHeight: 1.7, textAlign: 'left' }}>
          Recovery Co. may update these Terms of Service from time to time.
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.7, textAlign: 'left' }}>
          Changes will become effective once published on this website. Continued use of the website
          constitutes acceptance of the updated Terms.
        </Typography>
      </>
    ),
  },
  {
    title: '13. Governing Law',
    content: (
      <>
        <Typography variant="body1" sx={{ lineHeight: 1.7, textAlign: 'left' }}>
          These Terms of Service are governed by the laws of the Republic of South Africa.
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.7, textAlign: 'left' }}>
          Any disputes arising from these Terms shall be subject to the jurisdiction of the South
          African courts.
        </Typography>
      </>
    ),
  },
  {
    title: '14. Contact Us',
    content: (
      <>
        <Typography variant="body1" sx={{ lineHeight: 1.7, textAlign: 'left' }}>
          If you have any questions regarding these Terms of Service, please contact us:
        </Typography>
        <Box component="ul" sx={{ mt: 2, pl: 4, textAlign: 'left', '& li': { mb: 1 } }}>
          <Typography component="li" variant="body1">Email: [Insert Email Address]</Typography>
          <Typography component="li" variant="body1">
            Website: www.recoveryco.co.za (or your final website address)
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.7, textAlign: 'left' }}>
          We are committed to providing exceptional customer service and will respond to your enquiry
          as soon as reasonably practicable.
        </Typography>
      </>
    ),
  },
]

export default function Terms() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: 4,
          px: 4,
          position: 'relative',
        }}
      >
        <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
          <BackButton href="/" />
        </Box>
        <Box sx={{ textAlign: 'center', maxWidth: 720, width: '100%', mt: 8 }}>
          <Typography variant="h3" sx={{ fontWeight: 800 }}>
            Terms and Conditions
          </Typography>
        </Box>
        <Box sx={{ maxWidth: 720, width: '100%' }}>
          {sections.map((section) => (
            <Box key={section.title} sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                {section.title}
              </Typography>
              {section.content}
            </Box>
          ))}
        </Box>
      </Container>
    </motion.div>
  )
}
