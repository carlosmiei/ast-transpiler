<?php
require('helper.php');

class MyClass {
    function main_feature($message) {
        var_dump('Hello! I\'m inside main class:' . $message);
        non_transpilable_feature(); // invoke non-transpilable code here normally
    }

    function convert_to_int($number) {
        $conversion = intval($number);
        return $conversion;
    }
}

?>