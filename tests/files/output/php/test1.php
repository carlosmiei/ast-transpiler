class myClass {
    public function create_string() {
        return 'hello';
    }

    public function create_list() {
        return [1, 2, 3];
    }
}
$my_instance = new myClass();
$my_string = $my_instance->create_string();
$my_string .= 'append';
$my_list = $my_instance->create_list();
$my_list[] = 4;
$my_string_len = strlen($my_string);
$my_list_len = count($my_list);