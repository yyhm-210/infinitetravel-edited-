<?php
/**
 * Author: Tianyan He
 * Student Number: 400579318
 * Date: 2025/04/01
 *
 * Connect to school database.
 */
try {
    $dbh = new PDO(
        "mysql:host=localhost;dbname=infinitetravel",
        "het33",
        "HTYhty241632"
    );
} catch (Exception $e) {
    die("ERROR: Couldn't connect. {$e->getMessage()}");
}
