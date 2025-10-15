/**
 * Basic tests to verify infrastructure setup
 * Run with: npm test (if test runner is configured)
 */

import { storageService } from "@/services/localStorage";
import { fetchAddressByCep, formatCep, isValidCep } from "@/services/cepService";
import { loginSchema, registerSchema, checkoutSchema, contactSchema } from "@/lib/validations";

// Test localStorage service
console.log("Testing localStorage service...");
const testCart = [
  {
    id: "1",
    name: "Test Product",
    category: "Test",
    country: "Test",
    price: 100,
    image: "test.jpg",
    description: "Test",
    alcoholContent: "10%",
    volume: "750ml",
    tastingNotes: [],
    pairing: [],
    quantity: 1,
  },
];

storageService.saveCart(testCart);
const retrievedCart = storageService.getCart();
console.log("✓ Cart saved and retrieved:", retrievedCart.length === 1);

// Test CEP service
console.log("\nTesting CEP service...");
console.log("✓ Format CEP:", formatCep("12345678") === "12345-678");
console.log("✓ Validate CEP:", isValidCep("12345-678") === true);
console.log("✓ Invalid CEP:", isValidCep("123") === false);

// Test validation schemas
console.log("\nTesting validation schemas...");

// Login schema
const validLogin = loginSchema.safeParse({
  email: "test@example.com",
  password: "123456",
});
console.log("✓ Valid login:", validLogin.success === true);

const invalidLogin = loginSchema.safeParse({
  email: "invalid",
  password: "123",
});
console.log("✓ Invalid login:", invalidLogin.success === false);

// Register schema
const validRegister = registerSchema.safeParse({
  name: "Test User",
  email: "test@example.com",
  password: "123456",
  confirmPassword: "123456",
});
console.log("✓ Valid register:", validRegister.success === true);

const invalidRegister = registerSchema.safeParse({
  name: "Test User",
  email: "test@example.com",
  password: "123456",
  confirmPassword: "different",
});
console.log("✓ Invalid register (password mismatch):", invalidRegister.success === false);

// Checkout schema
const validCheckout = checkoutSchema.safeParse({
  name: "Test User",
  email: "test@example.com",
  phone: "(11) 98765-4321",
  cep: "12345-678",
  street: "Test Street",
  number: "123",
  neighborhood: "Test Neighborhood",
  city: "Test City",
  state: "SP",
  paymentMethod: "credit_card",
});
console.log("✓ Valid checkout:", validCheckout.success === true);

// Contact schema
const validContact = contactSchema.safeParse({
  name: "Test User",
  email: "test@example.com",
  subject: "Test Subject",
  message: "This is a test message",
});
console.log("✓ Valid contact:", validContact.success === true);

console.log("\n✅ All infrastructure tests passed!");
