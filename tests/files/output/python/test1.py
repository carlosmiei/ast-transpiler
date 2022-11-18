class myClass:
    def create_string(self):
        return 'hello'

    def create_list(self):
        return [1, 2, 3]
my_instance = myClass()
my_string = my_instance.create_string()
my_string += 'append'
my_list = my_instance.create_list()
my_list.append(4)
my_string_len = len(my_string)
my_list_len = len(my_list)