'use client';

import {
  Box,
  Container,
  Stack,
  SimpleGrid,
  Text,
  Link as ChakraLink,
  VStack,
  HStack,
  IconButton,
} from '@chakra-ui/react';
import { 
  Twitter, 
  Github, 
  MessageCircle, 
  Mail,
  Briefcase,
  Heart
} from 'lucide-react';
import Link from 'next/link';

const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href} passHref>
    <ChakraLink
      color="gray.400"
      _hover={{
        color: 'brand.400',
        textDecoration: 'none',
      }}
      transition="all 0.3s"
    >
      {children}
    </ChakraLink>
  </Link>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box bg="gray.900" color="gray.300" mt="auto">
      <Container maxW="7xl" py={12}>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={8}>
          {/* Brand Section */}
          <VStack align="start" spacing={4}>
            <HStack spacing={2}>
              <Box bg="brand.500" p={2} borderRadius="lg">
                <Briefcase size={20} color="white" />
              </Box>
              <Text fontSize="lg" fontWeight="800" color="white" fontFamily="heading">
                TaskBounty
              </Text>
            </HStack>
            <Text fontSize="sm" color="gray.400" maxW="250px">
              The decentralized platform for creating, completing, and earning from micro-tasks on the blockchain.
            </Text>
            <HStack spacing={2}>
              <IconButton
                as="a"
                href="https://twitter.com"
                target="_blank"
                aria-label="Twitter"
                icon={<Twitter size={18} />}
                size="sm"
                variant="ghost"
                color="gray.400"
                _hover={{ color: 'brand.400', bg: 'gray.800' }}
              />
              <IconButton
                as="a"
                href="https://github.com"
                target="_blank"
                aria-label="GitHub"
                icon={<Github size={18} />}
                size="sm"
                variant="ghost"
                color="gray.400"
                _hover={{ color: 'brand.400', bg: 'gray.800' }}
              />
              <IconButton
                as="a"
                href="https://discord.com"
                target="_blank"
                aria-label="Discord"
                icon={<MessageCircle size={18} />}
                size="sm"
                variant="ghost"
                color="gray.400"
                _hover={{ color: 'brand.400', bg: 'gray.800' }}
              />
              <IconButton
                as="a"
                href="mailto:hello@taskbounty.io"
                aria-label="Email"
                icon={<Mail size={18} />}
                size="sm"
                variant="ghost"
                color="gray.400"
                _hover={{ color: 'brand.400', bg: 'gray.800' }}
              />
            </HStack>
          </VStack>

          {/* Platform Links */}
          <VStack align="start" spacing={3}>
            <Text fontWeight="700" color="white" fontSize="sm" mb={1}>
              Platform
            </Text>
            <FooterLink href="/tasks">Browse Tasks</FooterLink>
            <FooterLink href="/tasks/create">Create Task</FooterLink>
            <FooterLink href="/categories">Categories</FooterLink>
            <FooterLink href="/leaderboard">Leaderboard</FooterLink>
            <FooterLink href="/stats">Statistics</FooterLink>
          </VStack>

          {/* Resources Links */}
          <VStack align="start" spacing={3}>
            <Text fontWeight="700" color="white" fontSize="sm" mb={1}>
              Resources
            </Text>
            <FooterLink href="/how-it-works">How It Works</FooterLink>
            <FooterLink href="/docs">Documentation</FooterLink>
            <FooterLink href="/faq">FAQ</FooterLink>
            <FooterLink href="/support">Support</FooterLink>
            <FooterLink href="/blog">Blog</FooterLink>
          </VStack>

          {/* Legal Links */}
          <VStack align="start" spacing={3}>
            <Text fontWeight="700" color="white" fontSize="sm" mb={1}>
              Legal
            </Text>
            <FooterLink href="/terms">Terms of Service</FooterLink>
            <FooterLink href="/privacy">Privacy Policy</FooterLink>
            <FooterLink href="/cookies">Cookie Policy</FooterLink>
            <FooterLink href="/guidelines">Community Guidelines</FooterLink>
          </VStack>
        </SimpleGrid>

        <Box borderTop="1px" borderColor="gray.700" my={8} />

        {/* Bottom Section */}
        <Stack
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align="center"
          spacing={4}
        >
          <Text fontSize="sm" color="gray.500">
            © {currentYear} TaskBounty. All rights reserved.
          </Text>
          <HStack spacing={1} fontSize="sm" color="gray.500">
            <Text>Built on</Text>
            <ChakraLink
              href="https://stacks.co"
              target="_blank"
              color="brand.400"
              fontWeight="600"
              _hover={{ color: 'brand.300' }}
            >
              Stacks
            </ChakraLink>
            <Text>with</Text>
            <Heart size={14} fill="currentColor" color="#ff006f" />
          </HStack>
        </Stack>
      </Container>
    </Box>
  );
}
