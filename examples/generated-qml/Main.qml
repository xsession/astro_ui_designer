import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

ApplicationWindow {
    id: astro_ui_project
    width: 800
    height: 600
    visible: true
    title: "astro-ui-project"
    Item {
        id: item_SiteHeader
        width: 100
        Item {
            id: item_MainNav
            Label {
                id: item_Brand
                text: "Astro UI Designer"
                font.pixelSize: 18
            }
            RowLayout {
                id: item_NavLinks
                spacing: 14
                Item {
                    id: item_Link11
                }
                Item {
                    id: item_Link12
                }
            }
        }
    }
    Item {
        id: item_Hero
        width: 100
        Item {
            id: item_Container14
            width: 100
            RowLayout {
                id: item_Row15
                spacing: 36
                ColumnLayout {
                    id: item_Column16
                    spacing: 18
                    Item {
                        id: item_Badge17
                        radius: 999
                        font.pixelSize: 12
                    }
                    Label {
                        id: item_Heading18
                        text: "Build responsive Astro interfaces visually."
                        font.pixelSize: 52
                    }
                    Label {
                        id: item_Text19
                        text: "Qt Creator-style workflow, web-native layout rules, reusable components, responsive states, actions, assets and clean Astro output."
                        color: "#4b5563"
                        font.pixelSize: 18
                    }
                    RowLayout {
                        id: item_Row20
                        spacing: 10
                        Button {
                            id: item_DocsButton
                            radius: 0
                            text: "Open docs"
                        }
                        Item {
                            id: item_Link23
                        }
                    }
                }
                Item {
                    id: item_PreviewCard
                    radius: 0
                    Label {
                        id: item_Heading25
                        text: "Source-first output"
                        font.pixelSize: 22
                    }
                    Label {
                        id: item_Text26
                        text: "Generated pages, components, layouts, CSS, assets and client actions stay readable and editable."
                        color: "#cfd8e3"
                        font.pixelSize: 16
                    }
                }
            }
        }
    }
    Item {
        id: item_Features
        width: 100
        Item {
            id: item_Container28
            width: 100
            Label {
                id: item_Heading29
                text: "A full visual frontend IDE"
                font.pixelSize: 32
            }
            Item {
                id: item_Spacer40
                width: 100
                height: 24
            }
            GridLayout {
                id: item_FeatureGrid
                spacing: 20
                Item {
                    id: item_Card31
                    radius: 0
                    Label {
                        id: item_Heading32
                        text: "Responsive layout"
                        font.pixelSize: 20
                    }
                    Label {
                        id: item_Text33
                        text: "Flex, Grid, breakpoints and freeform HMI layers."
                        font.pixelSize: 16
                    }
                }
                Item {
                    id: item_Card34
                    radius: 0
                    Label {
                        id: item_Heading35
                        text: "Reusable components"
                        font.pixelSize: 20
                    }
                    Label {
                        id: item_Text36
                        text: "Create project components with slots and instance overrides."
                        font.pixelSize: 16
                    }
                }
                Item {
                    id: item_Card37
                    radius: 0
                    Label {
                        id: item_Heading38
                        text: "Behavior"
                        font.pixelSize: 20
                    }
                    Label {
                        id: item_Text39
                        text: "State variables, bindings and web-native signal/action connections."
                        font.pixelSize: 16
                    }
                }
            }
        }
    }
}
