'use client'

import BackButton from '@/components/BackButton'
import { motion } from 'framer-motion'
import {
  Container,
  Box,
  Typography,
} from '@mui/material'

const today = new Date().toLocaleDateString('en-ZA', { day: '2-digit', month: 'long', year: 'numeric' })

const sections = [
  {
    title: 'Welcome to Recovery Co.',
    content: (
      <>
        <Typography variant="body1" sx={{ lineHeight: 1.7, textAlign: 'left' }}>
          Recovery Co. (&quot;Recovery Co.&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, disclose, and protect your personal information when you visit our website, place an order, or interact with our business.
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.7, textAlign: 'left' }}>
          Recovery Co. processes personal information in accordance with the Protection of Personal Information Act, 2013 (POPIA), and other applicable South African laws.
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.7, textAlign: 'left' }}>
          By using our website, you agree to the practices described in this Privacy Policy.
        </Typography>
      </>
    ),
  },
  {
    title: '1. Information We Collect',
    content: (
      <>
        <Typography variant="body1" sx={{ lineHeight: 1.7, textAlign: 'left' }}>
          We may collect the following information:
        </Typography>
        <Box component="ul" sx={{ mt: 2, pl: 4, textAlign: 'left', '& li': { mb: 1 } }}>
          <Typography component="li" variant="body1">Full name</Typography>
          <Typography component="li" variant="body1">Email address</Typography>
          <Typography component="li" variant="body1">Mobile or telephone number</Typography>
          <Typography component="li" variant="body1">Delivery and billing address</Typography>
          <Typography component="li" variant="body1">Payment information (processed securely through our payment provider)</Typography>
          <Typography component="li" variant="body1">Order history</Typography>
          <Typography component="li" variant="body1">Customer service enquiries</Typography>
          <Typography component="li" variant="body1">Marketing preferences</Typography>
          <Typography component="li" variant="body1">Device information, IP address, browser type, and website usage data collected through cookies and analytics technologies</Typography>
        </Box>
      </>
    ),
  },
  {
    title: '2. How We Use Your Information',
    content: (
      <>
        <Typography variant="body1" sx={{ lineHeight: 1.7, textAlign: 'left' }}>
          We use your information to:
        </Typography>
        <Box component="ul" sx={{ mt: 2, pl: 4, textAlign: 'left', '& li': { mb: 1 } }}>
          <Typography component="li" variant="body1">Process and fulfil your orders</Typography>
          <Typography component="li" variant="body1">Deliver products to you</Typography>
          <Typography component="li" variant="body1">Communicate about your purchases</Typography>
          <Typography component="li" variant="body1">Respond to customer enquiries</Typography>
          <Typography component="li" variant="body1">Improve our website, products, and customer experience</Typography>
          <Typography component="li" variant="body1">Send promotional communications where you have chosen to receive them</Typography>
          <Typography component="li" variant="body1">Detect fraud and protect our business</Typography>
          <Typography component="li" variant="body1">Comply with legal and regulatory obligations</Typography>
        </Box>
      </>
    ),
  },
  {
    title: '3. Marketing Communications',
    content: (
      <>
        <Typography variant="body1" sx={{ lineHeight: 1.7, textAlign: 'left' }}>
          If you choose to subscribe to our newsletter or marketing communications, we may send you information about new products, promotions, and company updates.
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.7, textAlign: 'left' }}>
          You may unsubscribe at any time by clicking the unsubscribe link in our emails or by contacting us directly.
        </Typography>
      </>
    ),
  },
  {
    title: '4. Sharing Your Information',
    content: (
      <>
        <Typography variant="body1" sx={{ lineHeight: 1.7, textAlign: 'left' }}>
          We do not sell your personal information.
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.7, textAlign: 'left' }}>
          We may share your information only with trusted third parties where necessary to operate our business, including:
        </Typography>
        <Box component="ul" sx={{ mt: 2, pl: 4, textAlign: 'left', '& li': { mb: 1 } }}>
          <Typography component="li" variant="body1">Payment service providers</Typography>
          <Typography component="li" variant="body1">Courier and delivery partners</Typography>
          <Typography component="li" variant="body1">Website hosting providers</Typography>
          <Typography component="li" variant="body1">IT service providers</Typography>
          <Typography component="li" variant="body1">Marketing and analytics service providers</Typography>
          <Typography component="li" variant="body1">Professional advisers where legally required</Typography>
        </Box>
        <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.7, textAlign: 'left' }}>
          These service providers are required to handle your information securely and only for authorised purposes.
        </Typography>
      </>
    ),
  },
  {
    title: '5. Payment Security',
    content: (
      <>
        <Typography variant="body1" sx={{ lineHeight: 1.7, textAlign: 'left' }}>
          Recovery Co. does not store your full payment card information.
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.7, textAlign: 'left' }}>
          Payments are processed through secure third-party payment providers using encrypted payment technology.
        </Typography>
      </>
    ),
  },
  {
    title: '6. Cookies',
    content: (
      <>
        <Typography variant="body1" sx={{ lineHeight: 1.7, textAlign: 'left' }}>
          Our website uses cookies to improve your browsing experience.
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.7, textAlign: 'left' }}>
          Cookies help us:
        </Typography>
        <Box component="ul" sx={{ mt: 2, pl: 4, textAlign: 'left', '& li': { mb: 1 } }}>
          <Typography component="li" variant="body1">Remember your preferences</Typography>
          <Typography component="li" variant="body1">Improve website functionality</Typography>
          <Typography component="li" variant="body1">Understand website traffic</Typography>
          <Typography component="li" variant="body1">Measure marketing performance</Typography>
        </Box>
        <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.7, textAlign: 'left' }}>
          You may disable cookies through your browser settings; however, some website features may not function correctly.
        </Typography>
      </>
    ),
  },
  {
    title: '7. Data Security',
    content: (
      <>
        <Typography variant="body1" sx={{ lineHeight: 1.7, textAlign: 'left' }}>
          We take reasonable technical and organisational measures to safeguard your personal information against unauthorised access, loss, misuse, alteration, or disclosure.
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.7, textAlign: 'left' }}>
          While we strive to protect your information, no online transmission or storage system can be guaranteed to be completely secure.
        </Typography>
      </>
    ),
  },
  {
    title: '8. Your Rights',
    content: (
      <>
        <Typography variant="body1" sx={{ lineHeight: 1.7, textAlign: 'left' }}>
          Subject to applicable law, you have the right to:
        </Typography>
        <Box component="ul" sx={{ mt: 2, pl: 4, textAlign: 'left', '& li': { mb: 1 } }}>
          <Typography component="li" variant="body1">Request access to your personal information</Typography>
          <Typography component="li" variant="body1">Request correction of inaccurate information</Typography>
          <Typography component="li" variant="body1">Request deletion of information where legally permitted</Typography>
          <Typography component="li" variant="body1">Object to certain processing activities</Typography>
          <Typography component="li" variant="body1">Withdraw consent where processing is based on consent</Typography>
          <Typography component="li" variant="body1">Lodge a complaint with the Information Regulator of South Africa</Typography>
        </Box>
      </>
    ),
  },
  {
    title: "9. Children's Privacy",
    content: (
      <>
        <Typography variant="body1" sx={{ lineHeight: 1.7, textAlign: 'left' }}>
          Recovery Co. products are intended for children; however, our website is intended for use by parents, guardians, and adults aged 18 years and older.
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.7, textAlign: 'left' }}>
          We do not knowingly collect personal information directly from children.
        </Typography>
      </>
    ),
  },
  {
    title: '10. Changes to This Privacy Policy',
    content: (
      <>
        <Typography variant="body1" sx={{ lineHeight: 1.7, textAlign: 'left' }}>
          We may update this Privacy Policy from time to time to reflect changes in our business or legal requirements.
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.7, textAlign: 'left' }}>
          The latest version will always be available on our website.
        </Typography>
      </>
    ),
  },
]

export default function Privacy() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: 4, px: 4, position: 'relative' }}>
        <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
          <BackButton href="/" />
        </Box>
        <Box sx={{ textAlign: 'center', maxWidth: 720, width: '100%', mt: 8 }}>
          <Typography variant="h3" sx={{ fontWeight: 800 }}>
            Privacy Policy
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            Last Updated: {today}
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