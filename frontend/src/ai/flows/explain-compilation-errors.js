'use server';

/**
 * @fileOverview Explains Java compilation errors in simple terms for users learning Java.
 *
 * - explainCompilationError - A function that takes a compilation error message and returns a simplified explanation.
 * - ExplainCompilationErrorInput - The input type for the explainCompilationError function.
 * - ExplainCompilationErrorOutput - The return type for the explainCompilationError function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainCompilationErrorInputSchema = z.object({
  errorMessage: z
    .string()
    .describe('The error message returned by the Java compiler.'),
});
export type ExplainCompilationErrorInput = z.infer<
  typeof ExplainCompilationErrorInputSchema
>;

const ExplainCompilationErrorOutputSchema = z.object({
  simplifiedExplanation: z
    .string()
    .describe('A simplified explanation of the error message.'),
});
export type ExplainCompilationErrorOutput = z.infer<
  typeof ExplainCompilationErrorOutputSchema
>;

export async function explainCompilationError(
  input: ExplainCompilationErrorInput
): Promise<ExplainCompilationErrorOutput> {
  return explainCompilationErrorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainCompilationErrorPrompt',
  input: {schema: ExplainCompilationErrorInputSchema},
  output: {schema: ExplainCompilationErrorOutputSchema},
  prompt: `You are an expert Java teacher. Your task is to explain Java compilation errors in simple terms so that beginners can easily understand and fix their code.

Error message: {{{errorMessage}}}

Simplified explanation:`,
});

const explainCompilationErrorFlow = ai.defineFlow(
  {
    name: 'explainCompilationErrorFlow',
    inputSchema: ExplainCompilationErrorInputSchema,
    outputSchema: ExplainCompilationErrorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
