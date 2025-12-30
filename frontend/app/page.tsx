'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  SimpleGrid,
  Card,
  CardBody,
  Icon,
  Badge,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  Users,
  TrendingUp,
  Shield,
  Zap,
  Award,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const FeatureCard = ({ 
  icon: IconComponent, 
  title, 
  description 
}: { 
  icon: any; 
  title: string; 
  description: string;
}) => (
  <MotionCard
    whileHover={{ y: -5 }}
    transition={{ duration: 0.3 }}
  >
    <CardBody>
      <VStack align="start" spacing={4}>
        <Box bg="brand.50" p={3} borderRadius="lg">
          <Icon as={IconComponent} boxSize={6} color="brand.500" />
        </Box>
        <Heading size="md">{title}</Heading>
        <Text color="gray.600">{description}</Text>
      </VStack>
    </CardBody>
  </MotionCard>
);

const StatCard = ({ 
  value, 
  label, 
  helpText 
}: { 
  value: string; 
  label: string; 
  helpText: string;
}) => (
  <Card>
    <CardBody>
      <VStack align="start" spacing={2}>
        <Text color="gray.600" fontSize="sm" fontWeight="medium">
          {label}
        </Text>
        <Heading color="brand.500" fontSize="3xl" fontWeight="800">
          {value}
        </Heading>
        <Text color="gray.500" fontSize="sm">
          {helpText}
        </Text>
      </VStack>
    </CardBody>
  </Card>
);

export default function HomePage() {
  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Navbar />
      
      {/* Hero Section */}
      <Box bg="gray.50" py={20}>
        <Container maxW="7xl">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <VStack spacing={6} textAlign="center" maxW="3xl" mx="auto">
              <Badge colorScheme="pink" fontSize="sm" px={3} py={1} borderRadius="full">
                Decentralized Task Marketplace
              </Badge>
              <Heading
                as="h1"
                size="3xl"
                fontWeight="900"
                bgGradient="linear(to-r, gray.800, brand.500)"
                bgClip="text"
              >
                Earn Crypto by Completing Micro-Tasks
              </Heading>
              <Text fontSize="xl" color="gray.600" maxW="2xl">
                Connect your wallet, browse available tasks, complete work, and get paid in STX. 
                Built on the Stacks blockchain for trust and transparency.
              </Text>
              <HStack spacing={4} pt={4}>
                <Link href="/tasks">
                  <Button size="lg">
                    <HStack spacing={2}>
                      <Text>Browse Tasks</Text>
                      <ArrowRight size={18} />
                    </HStack>
                  </Button>
                </Link>
                <Link href="/tasks/create">
                  <Button size="lg" variant="outline">
                    Create Task
                  </Button>
                </Link>
              </HStack>
            </VStack>
          </MotionBox>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxW="7xl" py={16}>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <StatCard value="1,234" label="Active Tasks" helpText="Available right now" />
          <StatCard value="5,678" label="Total Users" helpText="Creators & workers" />
          <StatCard value="45.6 STX" label="Total Paid Out" helpText="In the last 30 days" />
        </SimpleGrid>
      </Container>

      {/* Features Section */}
      <Box bg="white" py={20}>
        <Container maxW="7xl">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center" maxW="2xl" mx="auto">
              <Heading size="2xl" fontWeight="800">
                Why Choose TaskBounty?
              </Heading>
              <Text fontSize="lg" color="gray.600">
                A modern, decentralized platform that puts creators and workers first
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
              <FeatureCard
                icon={Shield}
                title="Secure Escrow"
                description="Funds are held in smart contracts until work is approved, protecting both parties."
              />
              <FeatureCard
                icon={Zap}
                title="Instant Payments"
                description="Get paid immediately when your work is approved. No waiting, no middlemen."
              />
              <FeatureCard
                icon={Award}
                title="Reputation System"
                description="Build your on-chain reputation and unlock higher-paying opportunities."
              />
              <FeatureCard
                icon={Users}
                title="Global Community"
                description="Connect with task creators and workers from around the world."
              />
              <FeatureCard
                icon={TrendingUp}
                title="Low Fees"
                description="Only 2.5% platform fee. Keep more of what you earn."
              />
              <FeatureCard
                icon={CheckCircle}
                title="Dispute Resolution"
                description="Fair dispute system protects both creators and workers."
              />
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box bg="gray.50" py={20}>
        <Container maxW="7xl">
          <VStack spacing={12}>
            <Heading size="2xl" fontWeight="800" textAlign="center">
              How It Works
            </Heading>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={12}>
              {/* For Task Creators */}
              <Box>
                <VStack align="start" spacing={6}>
                  <Badge colorScheme="pink" fontSize="md" px={4} py={2} borderRadius="full">
                    For Task Creators
                  </Badge>
                  <VStack align="start" spacing={4}>
                    {[
                      'Connect your Stacks wallet',
                      'Create a task with details and reward amount',
                      'Funds are held in escrow until completion',
                      'Review submitted work',
                      'Approve and rate worker',
                    ].map((step, index) => (
                      <HStack key={index} align="start">
                        <Box
                          bg="brand.500"
                          color="white"
                          borderRadius="full"
                          w={8}
                          h={8}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontWeight="bold"
                          flexShrink={0}
                        >
                          {index + 1}
                        </Box>
                        <Text fontSize="lg" pt={1}>{step}</Text>
                      </HStack>
                    ))}
                  </VStack>
                </VStack>
              </Box>

              {/* For Workers */}
              <Box>
                <VStack align="start" spacing={6}>
                  <Badge colorScheme="purple" fontSize="md" px={4} py={2} borderRadius="full">
                    For Workers
                  </Badge>
                  <VStack align="start" spacing={4}>
                    {[
                      'Connect your Stacks wallet',
                      'Browse and find tasks that match your skills',
                      'Claim a task to start working',
                      'Complete and submit your work',
                      'Get paid automatically when approved',
                    ].map((step, index) => (
                      <HStack key={index} align="start">
                        <Box
                          bg="purple.500"
                          color="white"
                          borderRadius="full"
                          w={8}
                          h={8}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontWeight="bold"
                          flexShrink={0}
                        >
                          {index + 1}
                        </Box>
                        <Text fontSize="lg" pt={1}>{step}</Text>
                      </HStack>
                    ))}
                  </VStack>
                </VStack>
              </Box>
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box bg="brand.500" color="white" py={20}>
        <Container maxW="4xl">
          <VStack spacing={8} textAlign="center">
            <Heading size="2xl" fontWeight="900">
              Ready to Get Started?
            </Heading>
            <Text fontSize="xl" opacity={0.9}>
              Join thousands of creators and workers already earning on TaskBounty
            </Text>
            <HStack spacing={4}>
              <Link href="/tasks">
                <Button
                  size="lg"
                  bg="white"
                  color="brand.500"
                  _hover={{ bg: 'gray.100' }}
                >
                  <HStack spacing={2}>
                    <Text>Start Earning Now</Text>
                    <ArrowRight size={18} />
                  </HStack>
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button
                  size="lg"
                  variant="outline"
                  borderColor="white"
                  color="white"
                  _hover={{ bg: 'whiteAlpha.200' }}
                >
                  Learn More
                </Button>
              </Link>
            </HStack>
          </VStack>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
