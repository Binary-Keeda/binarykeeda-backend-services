import mongoose, { Schema } from "mongoose";

const ProblemSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    required: true,
  },
  functionSignature: [
    {
      language: {
        type: String,
        enum: ["cpp", "c", "java", "python"],
        required: true
      },
      signature: {
        type: String,
        required: true
      }
    }
  ],
  sampleTestCases: [
    {
      input: String,
      output: String,
      explanation: String
    }
  ],
  testCases: [
    {
      input: String,
      output: String
    }
  ]
});

// Default function signatures with main function entry point
ProblemSchema.path('functionSignature').default([
  {
    language: 'cpp',
    signature:
`#include <iostream>
#include <vector>
using namespace std;

vector<int> functionName(vector<int>& input) {
    // your code here
    return {};
}

int main() {
    vector<int> input = {1, 2, 3};
    vector<int> result = functionName(input);
    for (int x : result) cout << x << " ";
    return 0;
}`
  },
  {
    language: 'c',
    signature:
`#include <stdio.h>

void functionName(int input[], int size) {
    // your code here
}

int main() {
    int input[] = {1, 2, 3};
    int size = sizeof(input)/sizeof(input[0]);
    functionName(input, size);
    return 0;
}`
  },
  {
    language: 'java',
    signature:
`public class Main {
    public static int[] functionName(int[] input) {
        // your code here
        return new int[]{};
    }

    public static void main(String[] args) {
        int[] input = {1, 2, 3};
        int[] result = functionName(input);
        for (int x : result) System.out.print(x + " ");
    }
}`
  },
  {
    language: 'python',
    signature:
`from typing import List

def function_name(input: List[int]) -> List[int]:
    # your code here
    return []

if __name__ == "__main__":
    input = [1, 2, 3]
    result = function_name(input)
    print(*result)`
  }
]);

const Problem = mongoose.model('Problem', ProblemSchema);

export default Problem;
