'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Badge,
  Flex,
} from '@chakra-ui/react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TaskCard from '@/components/TaskCard';
import { TASK_CATEGORIES } from '@/lib/constants';

// Mock data - replace with actual contract reads
const mockTasks = [
  {
    id: 1,
    title: 'Design a Logo for Web3 Startup',
    description: 'Need a modern, professional logo that represents blockchain technology and innovation. Should include variations for light and dark backgrounds.',
    category: 'Design',
    reward: 5000000, // 5 STX
    creator: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR',
    status: 0,
    deadline: 150000,
    workerReputation: 50,
  },
  {
    id: 2,
    title: 'Write 500-word Article on DeFi',
    description: 'Looking for an experienced crypto writer to create an informative article about decentralized finance trends in 2025.',
    category: 'Writing',
    reward: 2000000, // 2 STX
    creator: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE',
    status: 0,
    deadline: 145000,
    workerReputation: 60,
  },
  {
    id: 3,
    title: 'Test Smart Contract Functions',
    description: 'Need someone to thoroughly test all functions of a Clarity smart contract and document any bugs or issues found.',
    category: 'Testing',
    reward: 3500000, // 3.5 STX
    creator: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRT0HGD',
    status: 0,
    deadline: 148000,
    workerReputation: 70,
  },
  {
    id: 4,
    title: 'Social Media Graphics Package',
    description: 'Create a set of 10 social media graphics for Twitter, Instagram, and LinkedIn promoting our new NFT collection.',
    category: 'Design',
    reward: 4000000, // 4 STX
    creator: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
    status: 0,
    deadline: 152000,
    workerReputation: 55,
  },
  {
    id: 5,
    title: 'Translate Whitepaper to Spanish',
    description: 'Need a professional translation of our 20-page technical whitepaper from English to Spanish. Must maintain technical accuracy.',
    category: 'Translation',
    reward: 6000000, // 6 STX
    creator: 'SP1JWWHAQQ359EBKV4X77KM716AVSFCQ1AH56RVFX',
    status: 0,
    deadline: 155000,
    workerReputation: 75,
  },
  {
    id: 6,
    title: 'Market Research on Competitors',
    description: 'Comprehensive analysis of top 5 competitors in the blockchain task marketplace space. Include strengths, weaknesses, and opportunities.',
    category: 'Research',
    reward: 4500000, // 4.5 STX
    creator: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR',
    status: 0,
    deadline: 147000,
    workerReputation: 65,
  },
];

export default function TasksPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('reward-desc');

  const filteredTasks = mockTasks
    .filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || task.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'reward-desc':
          return b.reward - a.reward;
        case 'reward-asc':
          return a.reward - b.reward;
        case 'deadline-soon':
          return (a.deadline || 0) - (b.deadline || 0);
        default:
          return 0;
      }
    });

  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Navbar />

      <Container maxW="7xl" py={12}>
        <VStack align="start" spacing={8}>
          {/* Header */}
          <VStack align="start" spacing={2}>
            <Heading size="2xl" fontWeight="800">
              Browse Tasks
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Find tasks that match your skills and start earning STX
            </Text>
          </VStack>

          {/* Filters */}
          <Box w="full" bg="gray.50" p={6} borderRadius="xl">
            <VStack spacing={4} align="stretch">
              <HStack spacing={4} flexWrap="wrap">
                {/* Search */}
                <Box flex="1" minW="250px">
                  <InputGroup>
                    <InputLeftElement>
                      <Search size={18} color="#6c6f7a" />
                    </InputLeftElement>
                    <Input
                      placeholder="Search tasks..."
                      bg="white"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </InputGroup>
                </Box>

                {/* Category Filter */}
                <Select
                  bg="white"
                  maxW="200px"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  icon={<Filter size={18} />}
                >
                  <option value="all">All Categories</option>
                  {TASK_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>

                {/* Sort */}
                <Select
                  bg="white"
                  maxW="200px"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  icon={<SlidersHorizontal size={18} />}
                >
                  <option value="reward-desc">Highest Reward</option>
                  <option value="reward-asc">Lowest Reward</option>
                  <option value="deadline-soon">Deadline Soon</option>
                </Select>
              </HStack>

              {/* Active Filters */}
              <Flex gap={2} flexWrap="wrap">
                {selectedCategory !== 'all' && (
                  <Badge
                    colorScheme="pink"
                    px={3}
                    py={1}
                    borderRadius="full"
                    cursor="pointer"
                    onClick={() => setSelectedCategory('all')}
                  >
                    {selectedCategory} ✕
                  </Badge>
                )}
                {searchQuery && (
                  <Badge
                    colorScheme="purple"
                    px={3}
                    py={1}
                    borderRadius="full"
                    cursor="pointer"
                    onClick={() => setSearchQuery('')}
                  >
                    "{searchQuery}" ✕
                  </Badge>
                )}
              </Flex>
            </VStack>
          </Box>

          {/* Results Count */}
          <HStack justify="space-between" w="full">
            <Text color="gray.600">
              Showing <strong>{filteredTasks.length}</strong> tasks
            </Text>
          </HStack>

          {/* Task Grid */}
          {filteredTasks.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w="full">
              {filteredTasks.map((task) => (
                <TaskCard key={task.id} {...task} />
              ))}
            </SimpleGrid>
          ) : (
            <Box
              w="full"
              py={20}
              textAlign="center"
              bg="gray.50"
              borderRadius="xl"
            >
              <VStack spacing={4}>
                <Text fontSize="xl" fontWeight="600" color="gray.600">
                  No tasks found
                </Text>
                <Text color="gray.500">
                  Try adjusting your filters or search query
                </Text>
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                >
                  Clear Filters
                </Button>
              </VStack>
            </Box>
          )}
        </VStack>
      </Container>

      <Footer />
    </Box>
  );
}
