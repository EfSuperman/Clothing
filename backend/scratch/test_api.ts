import axios from 'axios';

async function testUpdate() {
  try {
    // Assuming we have a product ID from earlier checks or just try a dummy one
    const response = await axios.put('http://localhost:5000/api/products/any-id', {
      name: 'Test',
      price: 100,
      costPrice: 50,
      stockQty: 10,
      imageURLs: [],
      categoryId: 'invalid-id'
    });
    console.log(response.data);
  } catch (error: any) {
    console.log('STATUS:', error.response?.status);
    console.log('DATA:', error.response?.data);
  }
}

testUpdate();
