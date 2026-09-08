cmake_minimum_required(VERSION 3.21)
project(AstroDesignerQmlSample VERSION 1.0 LANGUAGES CXX)

find_package(Qt6 6.5 REQUIRED COMPONENTS Quick Qml QuickControls2)
qt_standard_project_setup(REQUIRES 6.5)

qt_add_executable(AstroDesignerQmlSample
    main.cpp
)

qt_add_qml_module(AstroDesignerQmlSample
    URI AstroDesigner.Sample
    VERSION 1.0
    QML_FILES
        Main.qml
)

target_link_libraries(AstroDesignerQmlSample
    PRIVATE Qt6::Quick Qt6::Qml Qt6::QuickControls2
)
