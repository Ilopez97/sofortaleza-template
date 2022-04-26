<?php
function active($currect_page)
{
    $url_array =  explode('/', $_SERVER['REQUEST_URI']);
    $url = end($url_array);
    if ($currect_page == $url) {
        echo 'active_link'; //class name in css
    }
}
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <!-- All Meta -->

    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <meta http-equiv="Expires" content="0">

    <meta http-equiv="Last-Modified" content="0">

    <meta http-equiv="Cache-Control" content="no-cache, mustrevalidate">

    <meta http-equiv="Pragma" content="no-cache">
    <!-- page title -->
    <title>Sofortaleza</title>
    <!-- Favicon Icon -->
    <link rel="shortcut icon" href="assets/images/factor_fav.png" type="image/png">
    <!-- All css -->
    <!--Bootstrap css-->
    <link rel="stylesheet" href="assets/css/bootstrap.min.css">
    <!-- Fontawesome css -->
    <link rel="stylesheet" href="assets/fonts/fontawesome/css/all.css">
    <!-- slick fader css -->
    <link rel="stylesheet" href="assets/css/slick.css">
    <link rel="stylesheet" href="assets/css/slick-theme.css">
    <!-- sidebar-menu -->
    <link rel="stylesheet" href="assets/css/sidebar-menu.css">
    <!--animate css-->
    <link rel="stylesheet" href="assets/css/animate.css">
    <!--style css-->
    <link rel="stylesheet" href="assets/css/style.css">
    <!--Style New Design-->
    <link rel="stylesheet" href="assets/css/style-fd.css">
    <link rel="stylesheet" href="assets/js/datatables/datatables.min.css">
    <link rel="stylesheet" href="assets/js/datatables/dataTables.bootstrap4.css">
</head>

<body>
    <!-- Preloader -->
    <div class="preloader">
        <div class="lds-ripple">
            <div></div>
            <div></div>
        </div>
    </div>
    <!-- Start header_area -->
    <header class="header_area header_v1 transparent_header">
        <div class="container">
            <nav class="navbar navbar-expand-lg navbar-light">
                <div class="container-fluid">
                    <a class="navbar-brand" href="#">Aquí va el logo</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                            <li class="nav-item">
                                <a class="nav-link active" aria-current="page" href="#">Home</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="#">Link</a>
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    </header><!-- End header_area -->