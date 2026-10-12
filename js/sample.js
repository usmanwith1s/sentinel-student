/**
 * Sentinel Student — Sample programs (Milestone 2)
 *
 * Pure data, no logic. The UI reads these to fill the sample dropdown.
 * Each sample: { id, label, code }
 * `code` is a normal string with \n for line breaks.
 */
window.SentinelSamples = [
  {
    id: "hello",
    label: "Hello World (works, 1 warning)",
    code:
      'public class Hello {\n' +
      '    public static void main(String[] args) {\n' +
      '        System.out.println("Hello, world!");\n' +
      '    }\n' +
      '}\n'
  },
  {
    id: "broken-braces",
    label: "Broken Braces (has an error)",
    code:
      'public class Broken {\n' +
      '    public static void main(String[] args) {\n' +
      '        int x = 5;\n' +
      '        if (x > 3) {\n' +
      '            x = x + 1;\n' +
      '        // oops, forgot the closing braces!\n'
  },
  {
    id: "oop-basics",
    label: "OOP: Class and Constructor",
    code:
      'public class Student {\n' +
      '    private String name;\n' +
      '    private int age;\n' +
      '\n' +
      '    public Student(String name, int age) {\n' +
      '        this.name = name;\n' +
      '        this.age = age;\n' +
      '    }\n' +
      '\n' +
      '    public String getName() {\n' +
      '        return name;\n' +
      '    }\n' +
      '}\n'
  },
  {
    id: "loop-practice",
    label: "Loops and Arrays",
    code:
      'public class SumArray {\n' +
      '    public static void main(String[] args) {\n' +
      '        int[] numbers = {1, 2, 3, 4, 5};\n' +
      '        int sum = 0;\n' +
      '        for (int i = 0; i < numbers.length; i++) {\n' +
      '            sum += numbers[i];\n' +
      '        }\n' +
      '        System.out.println("Sum: " + sum);\n' +
      '    }\n' +
      '}\n'
  }
];
