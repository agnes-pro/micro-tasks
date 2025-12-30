'use client';

import {
  Box,
  Flex,
  HStack,
  Button,
  Text,
  Container,
  IconButton,
  useDisclosure,
  VStack,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerContent,
  CloseButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { 
  Menu as MenuIcon, 
  Briefcase, 
  Search, 
  User, 
  Wallet,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { useStacks } from '@/providers/stacks-provider';

const MotionBox = motion(Box);

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href} passHref>
    <Button
      variant="ghost"
      color="gray.700"
      fontWeight="500"
      _hover={{
        color: 'brand.500',
        bg: 'gray.50',
      }}
      transition="all 0.3s ease"
    >
      {children}
    </Button>
  </Link>
);

const DropdownMenu = ({ 
  label, 
  icon: IconComponent, 
  items 
}: { 
  label: string; 
  icon: any; 
  items: { label: string; href: string; description?: string }[] 
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  return (
    <Popover
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      placement="bottom-start"
      trigger="hover"
    >
      <PopoverTrigger>
        <Button
          variant="ghost"
          color="gray.700"
          fontWeight="500"
          onMouseEnter={onOpen}
          onMouseLeave={onClose}
          _hover={{
            color: 'brand.500',
            bg: 'gray.50',
          }}
          _active={{
            bg: 'gray.100',
          }}
          transition="all 0.3s ease"
        >
          <HStack spacing={2}>
            <IconComponent size={18} />
            <Text>{label}</Text>
            <ChevronDown size={16} />
          </HStack>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        borderColor="gray.200"
        boxShadow="xl"
        w="280px"
        onMouseEnter={onOpen}
        onMouseLeave={onClose}
      >
      <PopoverBody p={2}>
        <VStack align="stretch" spacing={1}>
          {items.map((item, index) => (
            <Link key={index} href={item.href} passHref>
              <Button
                variant="ghost"
                justifyContent="start"
                size="sm"
                w="full"
                _hover={{
                  bg: 'brand.50',
                  color: 'brand.600',
                }}
                transition="all 0.2s ease"
                py={6}
              >
                <VStack align="start" spacing={0} w="full">
                  <Text fontWeight="600" fontSize="sm">{item.label}</Text>
                  {item.description && (
                    <Text fontSize="xs" color="gray.500">
                      {item.description}
                    </Text>
                  )}
                </VStack>
              </Button>
            </Link>
          ))}
        </VStack>
      </PopoverBody>
    </PopoverContent>
    </Popover>
  );
};

export default function Navbar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isConnected, connectWallet, disconnectWallet, userData } = useStacks();

  const tasksMenuItems = [
    { label: 'Browse Tasks', href: '/tasks', description: 'Find available tasks' },
    { label: 'Create Task', href: '/tasks/create', description: 'Post a new task' },
    { label: 'My Tasks', href: '/tasks/mine', description: 'Tasks you created' },
    { label: 'Active Work', href: '/tasks/active', description: 'Tasks you\'re working on' },
  ];

  const exploreMenuItems = [
    { label: 'Categories', href: '/categories', description: 'Browse by category' },
    { label: 'Top Workers', href: '/leaderboard', description: 'View top performers' },
    { label: 'Statistics', href: '/stats', description: 'Platform insights' },
  ];

  const accountMenuItems = [
    { label: 'Profile', href: '/profile', description: 'View your profile' },
    { label: 'Dashboard', href: '/dashboard', description: 'Your activity' },
    { label: 'Earnings', href: '/earnings', description: 'Track your income' },
    { label: 'Reputation', href: '/reputation', description: 'View your score' },
  ];

  return (
    <MotionBox
      as="nav"
      position="sticky"
      top={0}
      zIndex={1000}
      bg="white"
      borderBottom="1px"
      borderColor="gray.200"
      boxShadow="sm"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxW="7xl" py={4}>
        <Flex justify="space-between" align="center">
          {/* Logo */}
          <Link href="/" passHref>
            <HStack spacing={2} cursor="pointer" _hover={{ opacity: 0.8 }} transition="all 0.3s">
              <Box bg="brand.500" p={2} borderRadius="lg">
                <Briefcase size={24} color="white" />
              </Box>
              <Text fontSize="xl" fontWeight="800" color="gray.800" fontFamily="heading">
                TaskBounty
              </Text>
            </HStack>
          </Link>

          {/* Desktop Navigation */}
          <HStack spacing={1} display={{ base: 'none', lg: 'flex' }}>
            <DropdownMenu label="Tasks" icon={Briefcase} items={tasksMenuItems} />
            <DropdownMenu label="Explore" icon={Search} items={exploreMenuItems} />
            {isConnected && (
              <DropdownMenu label="Account" icon={User} items={accountMenuItems} />
            )}
          </HStack>

          {/* Wallet Connect & Mobile Menu */}
          <HStack spacing={3}>
            {isConnected ? (
              <Popover>
                <PopoverTrigger>
                  <Button
                    variant="outline"
                    display={{ base: 'none', md: 'flex' }}
                    fontWeight="600"
                  >
                    <HStack spacing={2}>
                      <Wallet size={18} />
                      <Text>
                        {userData?.profile?.stxAddress?.mainnet?.slice(0, 6)}...
                        {userData?.profile?.stxAddress?.mainnet?.slice(-4)}
                      </Text>
                    </HStack>
                  </Button>
                </PopoverTrigger>
                <PopoverContent w="200px">
                  <PopoverBody>
                    <Button
                      variant="ghost"
                      w="full"
                      onClick={disconnectWallet}
                      size="sm"
                    >
                      Disconnect
                    </Button>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            ) : (
              <Button
                onClick={connectWallet}
                display={{ base: 'none', md: 'flex' }}
                fontWeight="600"
              >
                <HStack spacing={2}>
                  <Wallet size={18} />
                  <Text>Connect Wallet</Text>
                </HStack>
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <IconButton
              aria-label="Open menu"
              variant="ghost"
              display={{ base: 'flex', lg: 'none' }}
              onClick={onOpen}
            >
              <MenuIcon />
            </IconButton>
          </HStack>
        </Flex>
      </Container>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">
            <HStack justify="space-between">
              <Text>Menu</Text>
              <CloseButton onClick={onClose} />
            </HStack>
          </DrawerHeader>
          <DrawerBody>
            <VStack align="stretch" spacing={4} mt={4}>
              <Text fontWeight="700" color="gray.600" fontSize="sm" textTransform="uppercase">
                Tasks
              </Text>
              {tasksMenuItems.map((item, index) => (
                <Link key={index} href={item.href} passHref>
                  <Button variant="ghost" justifyContent="start" onClick={onClose}>
                    {item.label}
                  </Button>
                </Link>
              ))}

              <Text fontWeight="700" color="gray.600" fontSize="sm" textTransform="uppercase" mt={4}>
                Explore
              </Text>
              {exploreMenuItems.map((item, index) => (
                <Link key={index} href={item.href} passHref>
                  <Button variant="ghost" justifyContent="start" onClick={onClose}>
                    {item.label}
                  </Button>
                </Link>
              ))}

              {isConnected && (
                <>
                  <Text fontWeight="700" color="gray.600" fontSize="sm" textTransform="uppercase" mt={4}>
                    Account
                  </Text>
                  {accountMenuItems.map((item, index) => (
                    <Link key={index} href={item.href} passHref>
                      <Button variant="ghost" justifyContent="start" onClick={onClose}>
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                </>
              )}

              <Box mt={6}>
                {isConnected ? (
                  <Button
                    w="full"
                    variant="outline"
                    onClick={() => {
                      disconnectWallet();
                      onClose();
                    }}
                  >
                    Disconnect Wallet
                  </Button>
                ) : (
                  <Button
                    w="full"
                    onClick={() => {
                      connectWallet();
                      onClose();
                    }}
                  >
                    Connect Wallet
                  </Button>
                )}
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </MotionBox>
  );
}
