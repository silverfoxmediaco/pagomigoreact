// src/pages/BillPayTest.jsx
import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

// MUI Components
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Paper,
  Divider
} from '@mui/material';

// MUI Icons
import {
  ElectricBolt as ElectricIcon,
  WaterDrop as WaterIcon,
  Wifi as WifiIcon,
  LocalGasStation as GasIcon,
  Home as HouseIcon,
  Apartment as ApartmentIcon,
  DirectionsCar as CarIcon,
  TwoWheeler as MotorcycleIcon,
  Security as InsuranceIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';

const BillPayTest = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [processingItem, setProcessingItem] = useState(null);

  // Handle payment with improved UX
  const handlePayment = async (paymentType) => {
    if (!user) {
      setPaymentStatus({
        type: 'error',
        message: t('pleaseLogInToMakePayments') || 'Please log in to make payments'
      });
      return;
    }

    setLoading(true);
    setProcessingItem(paymentType);
    setPaymentStatus(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Replace with your actual Unit API endpoint
      const response = await fetch('/api/unit/bill-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          paymentType: paymentType,
          payeeId: 'utility-company-id',
          amount: 100,
          accountId: user.unitAccountId,
          memo: `${paymentType} bill payment`
        })
      });

      const result = await response.json();

      if (response.ok) {
        setPaymentStatus({
          type: 'success',
          message: `${paymentType} ${t('paymentSuccessful') || 'payment successful'}!`
        });
      } else {
        throw new Error(result.message || t('paymentFailed') || 'Payment failed');
      }

    } catch (error) {
      console.error('Payment failed:', error);
      setPaymentStatus({
        type: 'error',
        message: `${t('paymentFailed') || 'Payment failed'}: ${error.message}`
      });
    } finally {
      setLoading(false);
      setProcessingItem(null);
    }
  };

  // Bill payment categories configuration
  const billCategories = [
    {
      title: t('utilities') || 'Utilities',
      description: t('utilitiesDesc') || 'Pay your utility bills quickly and securely',
      items: [
        {
          name: 'Electricity',
          label: t('payElectricity') || 'Pay Electricity',
          icon: <ElectricIcon />,
          color: '#FF9800'
        },
        {
          name: 'Water',
          label: t('payWater') || 'Pay Water',
          icon: <WaterIcon />,
          color: '#2196F3'
        },
        {
          name: 'Internet',
          label: t('payInternet') || 'Pay Internet',
          icon: <WifiIcon />,
          color: '#4CAF50'
        },
        {
          name: 'Gas',
          label: t('payGas') || 'Pay Gas',
          icon: <GasIcon />,
          color: '#F44336'
        }
      ]
    },
    {
      title: t('rentMortgage') || 'Rent & Mortgage',
      description: t('rentMortgageDesc') || 'Make your housing payments on time',
      items: [
        {
          name: 'Mortgage',
          label: t('payMortgage') || 'Pay Mortgage',
          icon: <HouseIcon />,
          color: '#795548'
        },
        {
          name: 'Rent',
          label: t('payRent') || 'Pay Rent',
          icon: <ApartmentIcon />,
          color: '#607D8B'
        }
      ]
    },
    {
      title: t('carTruckLoan') || 'Automotive',
      description: t('automotiveDesc') || 'Vehicle loans and insurance payments',
      items: [
        {
          name: 'Auto Loan',
          label: t('payAutoLoan') || 'Pay Auto Loan',
          icon: <CarIcon />,
          color: '#3F51B5'
        },
        {
          name: 'Bike Loan',
          label: t('payBikeLoan') || 'Pay Bike Loan',
          icon: <MotorcycleIcon />,
          color: '#E91E63'
        },
        {
          name: 'Insurance',
          label: t('payInsurance') || 'Pay Insurance',
          icon: <InsuranceIcon />,
          color: '#9C27B0'
        }
      ]
    }
  ];

  return (
    <>
      <Navigation />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              color: '#1976d2',
              mb: 2
            }}
          >
            {t('billPayTitle') || 'Bill Pay'}
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto' }}
          >
            Pay your bills quickly and securely with our integrated payment system
          </Typography>
        </Box>

        {/* Payment Status Alert */}
        {paymentStatus && (
          <Box sx={{ mb: 3 }}>
            <Alert 
              severity={paymentStatus.type}
              sx={{ 
                '& .MuiAlert-message': { fontSize: '16px' }
              }}
            >
              {paymentStatus.message}
            </Alert>
          </Box>
        )}

        {/* Bill Categories */}
        {billCategories.map((category, categoryIndex) => (
          <Paper 
            key={categoryIndex}
            elevation={2}
            sx={{ mb: 4, p: 3 }}
          >
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="h4" 
                component="h2" 
                gutterBottom
                sx={{ color: '#333', fontWeight: 600 }}
              >
                {category.title}
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ fontSize: '16px' }}
              >
                {category.description}
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              {category.items.map((item, itemIndex) => (
                <Grid item xs={12} sm={6} md={4} key={itemIndex} sx={{ display: 'flex' }}>
                  <Card 
                    elevation={3}
                    sx={{ 
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      minHeight: '280px',
                      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, textAlign: 'center', py: 3 }}>
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: '50%',
                          backgroundColor: `${item.color}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 2
                        }}
                      >
                        <Box
                          sx={{
                            color: item.color,
                            fontSize: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {item.icon}
                        </Box>
                      </Box>
                      
                      <Typography 
                        variant="h6" 
                        component="h3"
                        sx={{ 
                          fontWeight: 600,
                          color: '#333',
                          mb: 1
                        }}
                      >
                        {item.name}
                      </Typography>
                      
                      <Chip 
                        label="Available" 
                        size="small" 
                        color="success"
                        variant="outlined"
                      />
                    </CardContent>
                    
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => handlePayment(item.name)}
                        disabled={loading}
                        startIcon={
                          processingItem === item.name ? 
                            <CircularProgress size={20} color="inherit" /> : 
                            <PaymentIcon />
                        }
                        sx={{
                          backgroundColor: item.color,
                          py: 1.5,
                          fontSize: '16px',
                          textTransform: 'none',
                          fontWeight: 600,
                          '&:hover': {
                            backgroundColor: item.color,
                            filter: 'brightness(0.9)'
                          },
                          '&:disabled': {
                            backgroundColor: '#e0e0e0'
                          }
                        }}
                      >
                        {processingItem === item.name 
                          ? (t('processing') || 'Processing...') 
                          : item.label
                        }
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        ))}

        {/* Quick Stats */}
        <Paper elevation={2} sx={{ p: 3, mt: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom color="primary">
            Payment Statistics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                99.9%
              </Typography>
              <Typography color="text.secondary">Success Rate</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h4" color="primary.main" fontWeight="bold">
                &lt;2s
              </Typography>
              <Typography color="text.secondary">Average Processing</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h4" color="info.main" fontWeight="bold">
                24/7
              </Typography>
              <Typography color="text.secondary">Service Available</Typography>
            </Grid>
          </Grid>
        </Paper>
      </Container>
      
      <Footer />
    </>
  );
};

export default BillPayTest;