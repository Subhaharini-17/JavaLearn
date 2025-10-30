// /lib/challenges.ts
export interface TestCase {
  input: any[];
  expectedOutput: any;
  description?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  starterCode: string;
  solutionCode: string;
  testCases: TestCase[];
  hints?: string[];
}

export const challenges: Challenge[] = [
  {
    id: '1',
    title: 'Sum of Two Numbers',
    description: 'Write a function that takes two numbers as parameters and returns their sum.',
    difficulty: 'easy',
    category: 'Functions',
    starterCode: `public class Main {
    // Complete this function
    public static int sum(int a, int b) {
        // Your code here
        return 0;
    }
    
    public static void main(String[] args) {
        // Test your function here
        System.out.println(sum(5, 3)); // Should print 8
    }
}`,
    solutionCode: `public class Main {
    public static int sum(int a, int b) {
        return a + b;
    }
    
    public static void main(String[] args) {
        System.out.println(sum(5, 3));
    }
}`,
    testCases: [
      { input: [5, 3], expectedOutput: 8 },
      { input: [-2, 7], expectedOutput: 5 },
      { input: [0, 0], expectedOutput: 0 },
      { input: [100, -50], expectedOutput: 50 }
    ],
    hints: [
      'Use the + operator to add two numbers',
      'Make sure to return the result',
      'The function should work with both positive and negative numbers'
    ]
  },
  {
    id: '2',
    title: 'Find Maximum Number',
    description: 'Write a function that takes an array of integers and returns the maximum number in the array.',
    difficulty: 'easy',
    category: 'Arrays',
    starterCode: `public class Main {
    // Complete this function
    public static int findMax(int[] numbers) {
        // Your code here
        return 0;
    }
    
    public static void main(String[] args) {
        // Test your function here
        int[] testArray = {3, 7, 2, 9, 1};
        System.out.println(findMax(testArray)); // Should print 9
    }
}`,
    solutionCode: `public class Main {
    public static int findMax(int[] numbers) {
        if (numbers.length == 0) return -1;
        int max = numbers[0];
        for (int i = 1; i < numbers.length; i++) {
            if (numbers[i] > max) {
                max = numbers[i];
            }
        }
        return max;
    }
    
    public static void main(String[] args) {
        int[] testArray = {3, 7, 2, 9, 1};
        System.out.println(findMax(testArray));
    }
}`,
    testCases: [
      { input: [[3, 7, 2, 9, 1]], expectedOutput: 9 },
      { input: [[-5, -2, -10]], expectedOutput: -2 },
      { input: [[5]], expectedOutput: 5 },
      { input: [[0, 0, 0, 0]], expectedOutput: 0 }
    ],
    hints: [
      'Initialize a variable to store the maximum value',
      'Start by assuming the first element is the maximum',
      'Loop through the array and update the maximum when you find a larger number'
    ]
  },
  {
    id: '3',
    title: 'Palindrome Checker',
    description: 'Write a function that checks if a given string is a palindrome (reads the same forwards and backwards). Ignore case sensitivity.',
    difficulty: 'medium',
    category: 'Strings',
    starterCode: `public class Main {
    // Complete this function
    public static boolean isPalindrome(String str) {
        // Your code here
        return false;
    }
    
    public static void main(String[] args) {
        // Test your function here
        System.out.println(isPalindrome("racecar")); // Should print true
        System.out.println(isPalindrome("hello"));   // Should print false
    }
}`,
    solutionCode: `public class Main {
    public static boolean isPalindrome(String str) {
        String cleanStr = str.toLowerCase().replaceAll("[^a-zA-Z0-9]", "");
        int left = 0;
        int right = cleanStr.length() - 1;
        
        while (left < right) {
            if (cleanStr.charAt(left) != cleanStr.charAt(right)) {
                return false;
            }
            left++;
            right--;
        }
        return true;
    }
    
    public static void main(String[] args) {
        System.out.println(isPalindrome("racecar"));
        System.out.println(isPalindrome("hello"));
    }
}`,
    testCases: [
      { input: ["racecar"], expectedOutput: true },
      { input: ["hello"], expectedOutput: false },
      { input: ["A man a plan a canal Panama"], expectedOutput: true },
      { input: ["No 'x' in Nixon"], expectedOutput: true },
      { input: ["Java"], expectedOutput: false }
    ],
    hints: [
      'Convert the string to lowercase to ignore case',
      'Use two pointers - one starting from the beginning and one from the end',
      'Compare characters while moving pointers towards the center'
    ]
  },
  {
    id: '4',
    title: 'Fibonacci Sequence',
    description: 'Write a function that returns the nth number in the Fibonacci sequence. The Fibonacci sequence starts with 0 and 1, and each subsequent number is the sum of the two previous numbers.',
    difficulty: 'medium',
    category: 'Recursion',
    starterCode: `public class Main {
    // Complete this function
    public static int fibonacci(int n) {
        // Your code here
        return 0;
    }
    
    public static void main(String[] args) {
        // Test your function here
        System.out.println(fibonacci(6)); // Should print 8
    }
}`,
    solutionCode: `public class Main {
    public static int fibonacci(int n) {
        if (n <= 1) return n;
        int a = 0, b = 1;
        for (int i = 2; i <= n; i++) {
            int temp = a + b;
            a = b;
            b = temp;
        }
        return b;
    }
    
    public static void main(String[] args) {
        System.out.println(fibonacci(6));
    }
}`,
    testCases: [
      { input: [0], expectedOutput: 0 },
      { input: [1], expectedOutput: 1 },
      { input: [6], expectedOutput: 8 },
      { input: [10], expectedOutput: 55 },
      { input: [15], expectedOutput: 610 }
    ],
    hints: [
      'The Fibonacci sequence: 0, 1, 1, 2, 3, 5, 8, 13, ...',
      'You can use an iterative approach with a loop',
      'Alternatively, you can use recursion (but watch out for performance)',
      'Handle the base cases first (n = 0 and n = 1)'
    ]
  },
  {
    id: '5',
    title: 'Bank Account Class',
    description: 'Create a BankAccount class with deposit, withdraw, and getBalance methods. Ensure that withdrawals cannot make the balance negative.',
    difficulty: 'medium',
    category: 'OOP',
    starterCode: `// Complete the BankAccount class
class BankAccount {
    // Add properties and methods here
    
}

public class Main {
    public static void main(String[] args) {
        // Test your class here
        BankAccount account = new BankAccount(1000);
        account.deposit(500);
        account.withdraw(200);
        System.out.println("Balance: " + account.getBalance()); // Should print 1300
    }
}`,
    solutionCode: `class BankAccount {
    private double balance;
    
    public BankAccount(double initialBalance) {
        this.balance = initialBalance;
    }
    
    public void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
        }
    }
    
    public boolean withdraw(double amount) {
        if (amount > 0 && amount <= balance) {
            balance -= amount;
            return true;
        }
        return false;
    }
    
    public double getBalance() {
        return balance;
    }
}

public class Main {
    public static void main(String[] args) {
        BankAccount account = new BankAccount(1000);
        account.deposit(500);
        account.withdraw(200);
        System.out.println("Balance: " + account.getBalance());
    }
}`,
    testCases: [
      { input: [1000, 500, 200], expectedOutput: 1300 },
      { input: [500, 100, 700], expectedOutput: 500 }, // Withdrawal should fail
      { input: [100, 50, 50], expectedOutput: 100 },
      { input: [0, 100, 50], expectedOutput: 100 }
    ],
    hints: [
      'Use a private field to store the balance',
      'Validate input amounts in deposit and withdraw methods',
      'Return a boolean from withdraw to indicate success',
      'Make sure withdrawals cannot exceed the current balance'
    ]
  }
];