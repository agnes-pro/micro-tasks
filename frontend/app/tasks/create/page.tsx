'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Textarea,
  Select,
  Button,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Card,
  CardBody,
  useToast,
  HStack,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react';
import { useState } from 'react';
import { Briefcase, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useStacks } from '@/providers/stacks-provider';
import { TASK_CATEGORIES, PLATFORM_CONFIG } from '@/lib/constants';
import { stxToMicroStx, microStxToStx, createTask } from '@/lib/stacks';
import { openContractCall } from '@stacks/connect';

export default function CreateTaskPage() {
  const router = useRouter();
  const toast = useToast();
  const { isConnected, userData, network } = useStacks();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    reward: 1,
    deadline: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to create a task',
        status: 'error',
        duration: 5000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const rewardInMicroStx = stxToMicroStx(formData.reward);
      const deadlineBlock = parseInt(formData.deadline);

      const options = await createTask({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        reward: rewardInMicroStx,
        deadline: deadlineBlock,
        senderAddress: userData?.profile?.stxAddress?.mainnet || '',
      });

      await openContractCall(options);

      toast({
        title: 'Task created successfully!',
        description: 'Your task has been posted to the blockchain',
        status: 'success',
        duration: 5000,
      });

      router.push('/tasks');
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Error creating task',
        description: 'There was an error posting your task. Please try again.',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const platformFee = formData.reward * (PLATFORM_CONFIG.PLATFORM_FEE_RATE / 10000);
  const totalCost = formData.reward + platformFee;

  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Navbar />

      <Container maxW="4xl" py={12}>
        <VStack align="start" spacing={8}>
          {/* Header */}
          <VStack align="start" spacing={2}>
            <HStack>
              <Box bg="brand.500" p={2} borderRadius="lg">
                <Briefcase size={24} color="white" />
              </Box>
              <Heading size="2xl" fontWeight="800">
                Create a New Task
              </Heading>
            </HStack>
            <Text fontSize="lg" color="gray.600">
              Post a task and have skilled workers complete it for you
            </Text>
          </VStack>

          {!isConnected && (
            <Alert status="warning" borderRadius="lg">
              <AlertIcon />
              <AlertDescription>
                You need to connect your wallet before creating a task
              </AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <Card w="full">
            <CardBody>
              <form onSubmit={handleSubmit}>
                <VStack spacing={6}>
                  {/* Title */}
                  <FormControl isRequired>
                    <FormLabel fontWeight="600">Task Title</FormLabel>
                    <Input
                      placeholder="e.g., Design a logo for my startup"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      size="lg"
                    />
                    <FormHelperText>
                      A clear, concise title that describes your task
                    </FormHelperText>
                  </FormControl>

                  {/* Description */}
                  <FormControl isRequired>
                    <FormLabel fontWeight="600">Description</FormLabel>
                    <Textarea
                      placeholder="Describe what you need done, requirements, deliverables, etc."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows={6}
                      size="lg"
                    />
                    <FormHelperText>
                      Provide detailed instructions and requirements
                    </FormHelperText>
                  </FormControl>

                  {/* Category */}
                  <FormControl isRequired>
                    <FormLabel fontWeight="600">Category</FormLabel>
                    <Select
                      placeholder="Select a category"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      size="lg"
                    >
                      {TASK_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </Select>
                    <FormHelperText>
                      Choose the category that best fits your task
                    </FormHelperText>
                  </FormControl>

                  {/* Reward */}
                  <FormControl isRequired>
                    <FormLabel fontWeight="600">Reward (STX)</FormLabel>
                    <NumberInput
                      value={formData.reward}
                      onChange={(valueString) =>
                        setFormData({
                          ...formData,
                          reward: parseFloat(valueString) || 0,
                        })
                      }
                      min={microStxToStx(PLATFORM_CONFIG.MIN_TASK_REWARD)}
                      max={microStxToStx(PLATFORM_CONFIG.MAX_TASK_REWARD)}
                      precision={6}
                      step={0.1}
                      size="lg"
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormHelperText>
                      Amount you'll pay to the worker (min: 0.1 STX)
                    </FormHelperText>
                  </FormControl>

                  {/* Deadline */}
                  <FormControl isRequired>
                    <FormLabel fontWeight="600">Deadline (Block Height)</FormLabel>
                    <Input
                      type="number"
                      placeholder="e.g., 150000"
                      value={formData.deadline}
                      onChange={(e) =>
                        setFormData({ ...formData, deadline: e.target.value })
                      }
                      size="lg"
                    />
                    <FormHelperText>
                      Block height when the task must be completed
                    </FormHelperText>
                  </FormControl>

                  {/* Cost Breakdown */}
                  <Box w="full" bg="gray.50" p={4} borderRadius="lg">
                    <VStack align="stretch" spacing={2}>
                      <HStack justify="space-between">
                        <Text>Worker Reward:</Text>
                        <Text fontWeight="600">{formData.reward.toFixed(6)} STX</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>Platform Fee (2.5%):</Text>
                        <Text fontWeight="600">{platformFee.toFixed(6)} STX</Text>
                      </HStack>
                      <Box borderTop="1px" borderColor="gray.300" pt={2}>
                        <HStack justify="space-between">
                          <Text fontWeight="700" fontSize="lg">
                            Total Cost:
                          </Text>
                          <Text fontWeight="700" fontSize="lg" color="brand.500">
                            {totalCost.toFixed(6)} STX
                          </Text>
                        </HStack>
                      </Box>
                    </VStack>
                  </Box>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    size="lg"
                    w="full"
                    isLoading={isSubmitting}
                    isDisabled={!isConnected || isSubmitting}
                  >
                    <HStack spacing={2}>
                      <DollarSign size={20} />
                      <Text>{isConnected ? 'Create Task & Deposit Funds' : 'Connect Wallet First'}</Text>
                    </HStack>
                  </Button>
                </VStack>
              </form>
            </CardBody>
          </Card>
        </VStack>
      </Container>

      <Footer />
    </Box>
  );
}
