/**
 * Admin Infrastructure Tests
 * Tests for admin authentication, session management, and product CRUD operations
 * Run manually in browser console or with a test runner
 */

import { adminStorageService, hashPassword, validateCredentials } from '@/services/adminStorage';
import { Admin, Product } from '@/types';

console.log('=== Admin Infrastructure Tests ===\n');

// Helper function to run async tests
async function runTests() {
  let passedTests = 0;
  let failedTests = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✓ ${message}`);
      passedTests++;
    } else {
      console.error(`✗ ${message}`);
      failedTests++;
    }
  }

  // Clear localStorage before tests
  localStorage.clear();

  // Test 1: Password Hashing
  console.log('\n--- Password Hashing Tests ---');
  const password = 'admin123';
  const hash1 = await hashPassword(password);
  const hash2 = await hashPassword(password);
  assert(hash1 === hash2, 'Password hashes consistently');
  assert(hash1.length === 64, 'Hash is 64 characters (SHA-256)');

  const differentHash = await hashPassword('different');
  assert(hash1 !== differentHash, 'Different passwords produce different hashes');

  // Test 2: Credential Validation
  console.log('\n--- Credential Validation Tests ---');
  const validCreds = await validateCredentials('admin@timtimboutique.com', 'admin123');
  assert(validCreds === true, 'Valid credentials accepted');

  const invalidEmail = await validateCredentials('wrong@email.com', 'admin123');
  assert(invalidEmail === false, 'Invalid email rejected');

  const invalidPassword = await validateCredentials('admin@timtimboutique.com', 'wrongpass');
  assert(invalidPassword === false, 'Invalid password rejected');

  // Test 3: Admin Authentication
  console.log('\n--- Admin Authentication Tests ---');
  const admin = await adminStorageService.authenticateAdmin('admin@timtimboutique.com', 'admin123');
  assert(admin !== null, 'Admin authenticated with correct credentials');
  assert(admin?.email === 'admin@timtimboutique.com', 'Admin email is correct');
  assert(admin?.name === 'Administrador', 'Admin name is correct');
  assert(admin?.id === 'admin-001', 'Admin ID is correct');

  const failedAuth = await adminStorageService.authenticateAdmin('wrong@email.com', 'wrongpass');
  assert(failedAuth === null, 'Authentication fails with wrong credentials');

  // Test 4: Admin Session Management
  console.log('\n--- Admin Session Management Tests ---');
  const mockAdmin: Admin = {
    id: 'admin-001',
    email: 'admin@timtimboutique.com',
    name: 'Administrador',
  };

  const saveResult = adminStorageService.saveAdminSession(mockAdmin);
  assert(saveResult === true, 'Admin session saved successfully');

  const session = adminStorageService.getAdminSession();
  assert(session !== null, 'Admin session retrieved');
  assert(session?.email === mockAdmin.email, 'Session email matches');

  const isAuth = adminStorageService.isAdminAuthenticated();
  assert(isAuth === true, 'Admin is authenticated');

  adminStorageService.clearAdminSession();
  const clearedSession = adminStorageService.getAdminSession();
  assert(clearedSession === null, 'Admin session cleared');
  assert(adminStorageService.isAdminAuthenticated() === false, 'Admin is not authenticated after logout');

  // Test 5: Product Management
  console.log('\n--- Product Management Tests ---');
  const mockProduct: Product = {
    id: 'test-1',
    name: 'Test Product',
    category: 'Cerveja',
    country: 'Brasil',
    price: 10.00,
    image: 'https://example.com/image.jpg',
    description: 'Test description',
    alcoholContent: '5%',
    volume: '350ml',
    tastingNotes: ['Test note'],
    pairing: ['Test pairing'],
    stock: 10,
  };

  const emptyProducts = adminStorageService.getProducts();
  assert(emptyProducts.length === 0, 'Products array is initially empty');

  const addResult = adminStorageService.addProduct(mockProduct);
  assert(addResult === true, 'Product added successfully');

  const products = adminStorageService.getProducts();
  assert(products.length === 1, 'Products array has 1 product');
  assert(products[0].name === mockProduct.name, 'Product name matches');

  const updateResult = adminStorageService.updateProduct('test-1', {
    name: 'Updated Product',
    price: 15.00,
  });
  assert(updateResult === true, 'Product updated successfully');

  const updatedProduct = adminStorageService.getProductById('test-1');
  assert(updatedProduct?.name === 'Updated Product', 'Product name updated');
  assert(updatedProduct?.price === 15.00, 'Product price updated');
  assert(updatedProduct?.updatedAt !== undefined, 'Product has updatedAt timestamp');

  const updateNonExistent = adminStorageService.updateProduct('non-existent', { name: 'Test' });
  assert(updateNonExistent === false, 'Updating non-existent product returns false');

  const deleteResult = adminStorageService.deleteProduct('test-1');
  assert(deleteResult === true, 'Product deleted successfully');
  assert(adminStorageService.getProducts().length === 0, 'Products array is empty after deletion');

  const deleteNonExistent = adminStorageService.deleteProduct('non-existent');
  assert(deleteNonExistent === false, 'Deleting non-existent product returns false');

  // Test 6: Statistics
  console.log('\n--- Statistics Tests ---');
  adminStorageService.addProduct({
    id: '1',
    name: 'Product 1',
    category: 'Cerveja',
    country: 'Brasil',
    price: 10,
    image: 'test.jpg',
    description: 'Test',
    alcoholContent: '5%',
    volume: '350ml',
    tastingNotes: [],
    pairing: [],
    stock: 10,
  });

  adminStorageService.addProduct({
    id: '2',
    name: 'Product 2',
    category: 'Vinho',
    country: 'Brasil',
    price: 20,
    image: 'test.jpg',
    description: 'Test',
    alcoholContent: '12%',
    volume: '750ml',
    tastingNotes: [],
    pairing: [],
    stock: 3,
  });

  adminStorageService.addProduct({
    id: '3',
    name: 'Product 3',
    category: 'Whisky',
    country: 'Escócia',
    price: 150,
    image: 'test.jpg',
    description: 'Test',
    alcoholContent: '40%',
    volume: '750ml',
    tastingNotes: [],
    pairing: [],
    stock: 0,
  });

  const stats = adminStorageService.getStats();
  assert(stats.totalProducts === 3, 'Total products count is correct');
  assert(stats.featuredProducts === 2, 'Featured products count is correct (stock > 0)');
  assert(stats.lowStockProducts === 1, 'Low stock products count is correct (0 < stock < 5)');

  // Test 7: Product Initialization
  console.log('\n--- Product Initialization Tests ---');
  localStorage.removeItem('timtim_products'); // Clear products

  const defaultProducts: Product[] = [
    {
      id: '1',
      name: 'Test Product',
      category: 'Cerveja',
      country: 'Brasil',
      price: 10,
      image: 'test.jpg',
      description: 'Test',
      alcoholContent: '5%',
      volume: '350ml',
      tastingNotes: [],
      pairing: [],
      stock: 10,
    },
  ];

  const initResult = adminStorageService.initializeProducts(defaultProducts);
  assert(initResult === true, 'Products initialized successfully');

  const initializedProducts = adminStorageService.getProducts();
  assert(initializedProducts.length === 1, 'Initialized products count is correct');
  assert(initializedProducts[0].createdAt !== undefined, 'Initialized product has createdAt');
  assert(initializedProducts[0].updatedAt !== undefined, 'Initialized product has updatedAt');

  // Test that initialization doesn't overwrite existing products
  const initAgain = adminStorageService.initializeProducts([
    {
      id: 'new',
      name: 'New Product',
      category: 'Vinho',
      country: 'Brasil',
      price: 20,
      image: 'test.jpg',
      description: 'Test',
      alcoholContent: '12%',
      volume: '750ml',
      tastingNotes: [],
      pairing: [],
      stock: 5,
    },
  ]);
  assert(initAgain === true, 'Second initialization succeeds');
  assert(adminStorageService.getProducts().length === 1, 'Existing products not overwritten');
  assert(adminStorageService.getProducts()[0].id === '1', 'Original product still exists');

  // Summary
  console.log('\n=== Test Summary ===');
  console.log(`✓ Passed: ${passedTests}`);
  console.log(`✗ Failed: ${failedTests}`);
  console.log(`Total: ${passedTests + failedTests}`);

  if (failedTests === 0) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n⚠️ Some tests failed. Please review the errors above.');
  }
}

// Run tests
runTests().catch(console.error);
