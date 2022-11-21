from helper import non_transpilable_feature


class MyClass:
    def main_feature(self, message):
        print('Hello! I\'m inside main class:' + message)
        non_transpilable_feature()  # invoke non-transpilable code here normally

    def convert_to_int(self, number):
        conversion = int(number)
        return conversion
