# Alexa-Skill-Exam-Reminder
Alexa Skill for creating reminders for an exam 

CreateReminderIntent

Dieser Intent soll Erinnerungen erstellen, die von einem Nutzer sprachlich angeordnet werden. 
Für diesen Intent werden passende Aufweck Sätze definiert. 
Wenn diese Aufweck Sätze erkannt werden, wird dieser Code ausgeführt.
Beim Erstellen dieses Intents wurden zwei Slots definiert. 
Diese werden benötigt um Schlüsselwörter aus dem Gesprochenen zu erkennen. 
Diese Funktion benötigt das Fach und das Datum.
Nun gehen wir auf den Code im Backend ein. 
Hier wird zuvor ein Konstrukt aufgebaut, der überprüft, ob dieser Intent bestätigt oder abgelehnt worden ist. 
Wie im vorherigen Intent werden anschließend die Reminder und die List Funktion initialisiert. 
Um die von Alexa erkannten Slots im Code benutzen zu können, muss dies ebenfalls in einer Konstante initialisiert werden.
Die Herausforderung hier ist, mit einem gegebenen Prüfungstermin weitere Termine und mit diesen Terminen jeweils Erinnerungen an verschiedenen Tagen zu erstellen. 
An dieser Stelle sollte erwähnt werden, dass die Abstände und die Zeit in denen aktuell erinnert wird, keine pädagogischen oder psychologischen Aspekte betrachtet werden. 
Es wird lediglich ein Konzept aufgebaut der die Funktionalität aufzeigen soll. 
Zurzeit wird 28 Tage vor der Prüfung angefangen eine Erinnerung einzustellen. 
Der zeitliche Abstand wurde hier auf drei Tage festgesetzt und jeweils um 12 Uhr wird die Erinnerung ausgelöst. 
Zusammengefasst sollen die Erinnerungen 28 Tage vor der eigentlichen Prüfung in drei Tages abschnitten und um 12 Uhr jeweils ausgelöst werden.
Um dies codieren zu können müssen zwei Fälle betrachtet werden. 
Zum einen der Fall, dass der Prüfungstag weiter als 28 Tage vorne liegt und der Fall, dass dieser näher als 28 Tage vorliegt.
Wenn der Prüfungstermin weiter als 28 Tage vorne liegt, dann sollen die zuvor genannten Schritte so ausgeführt werden. 
Mithilfe von einer Zusatzfunktion werden die erwünschten Daten generiert und der Reminder Api gesendet damit die einzelnen für die ErinnerungDaten erfasst werden. 
Liegt der Prüfungstermin weniger als 28 Tage vorne. 
Dann wird die Differenz von dem aktuellen Tag und dem Prüfungstermin genommen und wie in dem vorherigen Abschnitt, wird in drei Tages Abständen erinnert.
Wie bereits erwähnt müssen die Daten fürs Generieren der Erinnerungen im JOSN Format abgelegt werden. Darin müssen der Name und das Datum der Erinnerung enthalten sein, die aus den Slots entnommen werden.
Nachdem die Erinnerungen erstellt worden sind, wird ein Eintrag in die Liste der Lernfortschritte hinzugefügt, mit dem Namen des Faches und dem Lernfortschritt von 0\%.

getReminderIntent

Diese Funktion steht dafür, den erfassten Lernfortschritt wiederzugeben. 
Es mussten einige Zusatzfunktionen erstellt werden, damit die Daten entsprechend erfasst und verarbeitet werden können. 
Aus dem globalen Array „allItems“ werden alle Elemente aus der Alexa Liste "Lern Fortschritt"gelesen. 
Den Namen des zu suchenden Elements bekommt die Funktion von dem Slot. 
Wenn diese Funktion aufgerufen werden soll, wie beispielsweise „Alexa, Wie ist mein Lernfortschritt in Mathe?“, erkennt das System, dass Mathe an dieser Stelle das Fach ist. 
Mit dieser Information wird das Array mit allen Elementen nach diesem Namen durchsucht. Anschließend wird eine Sprachaussage generiert, die die erwünschten Informationen gibt, entnommen aus der generierten Liste in Alexa.
Diese Elemente werden wie in der vorherigen Funktion bereits erwähnt, beim Erstellen einer Erinnerung erzeugt. 

UpdateLearnProgress

Die letzte Grundlegende Funktion des Skills soll die eingespeicherten Items aktualisieren. 
Diese Funktion greift auf die Alexa Liste "Lern Fortschritte" zu, in der die Fächer mit den Prozenten hinterlegt worden sind. 
Idealerweise sollen sich die eingepflegten Prozente bzw. die Lernfortschritte mit der Zeit erhöhen. 
Um herauszufinden welches Fach mit welcher Prozentzahl geändert werden soll, muss an dieser Stelle auf die definierten Slots zugegriffen werden. 
In dem Fall wurden Slots für das Fach und für die Prozentzahl definiert. 
Alexa erkennt welcher Satzabschnitt welchem Slot gehört und erlaubt dem Nutzer drauf zuzugreifen. 
Die "Lern Fortschritte" Liste wird anhand der Informationen aus dem Slot durchsucht.
Wenn dieses Fach in dieser Alexa Liste enthalten ist, wird die ID von diesem Element gespeichert. 
Mit dieser Element ID können Operationen mithilfe der List Api ausgeführt werden. 
Für unseren Fall wird die Prozentzahl abgeändert. 
Die Prozentzahl wird von dem entsprechendem Slot entnommen. 
Wenn alle Informationen gegeben sind, werden mithilfe einer Zusatzfunktion alle nötigen Parameter gesammelt und an die API weitergegeben. 
Somit wird der entsprechende Eintrag, in der Alexa Liste "Lern Fortschritte", abgeändert und aktualisiert.

Zusatzfunktionen

In den vorherigen Kapiteln war mehrmals die Rede von Zusatzfunktionen, die für eine Vereinfachung und eine bessere Struktur im Code sorgen sollen. 
Nun widmen wir uns dieser Funktionen und stellen diese vor. 
Es ist noch zu erwähnen, dass an dieser Stelle nicht jede Zeile angesprochen wird, da der Code ausreichend kommentiert ist.

getReminderJson

Diese Funktion erwartet zwei Parameter „date“ und „subject“. 
Mit diesen Parametern erstellt die Funktion eine Variable im JSON Format und gibt diese als Rückgabewert zurück. 
Die Konstante entspricht einer Anforderung im Format welches von Alexa angenommen werden kann. Dieses Format kann nur eingesetzt werden um eine Erinnerung zu erstellen. 
Man muss hier nur den Namen der Erinnerung und das Datum definieren.

Mydiff

Diese Funktion erwartet drei Parameter „date1“, „date2“ und „interval“. 
Mit diesen Parametern erstellt die Funktion die Differenz zwischen zwei gegeben Daten. 
Den Rückgabewert kann man mit dem Parameter „interval“ bestimmen. Hier gibt man an in welcher Zeiteinheit der Wert errechnet werden soll. Für unseren Fall reicht es aus, wenn die Tage angegeben werden. 
Diese Funktion wird beim Erstellen der Erinnerungen benötigt.
Zur Hilfestellung wurde hier eine Quelle aus dem Internet benutzt. ~\cite{unitjajodia2019}

Getdate

Diese Funktion erwartet zwei Parameter „givendate“ und „days“. 
Mit diesen Parametern wird ein Array zurückgegeben, dass die Tage speichert, in denen eine Erinnerung erstellt werden soll. 
Mit dem ersten Parameter wird ein Startdatum eingegeben und der zweite Parameter gibt an, wie viele Tage zurück das Enddatum liegen soll. 
Die Abstände der Tage, die im Array gespeichert werden sollen, werden im Code definiert.

getTodoListWithId

Diese Funktion erwartet einen Parameter „Json“ und gibt ein vereinfachtes Array zurück. 
Mit dieser Funktion werden alle Alexa Listen in einem vereinfachten Array gespeichert. 
Mithilfe dieser Methode können die Alexa Listen in einer globalen Variable gespeichert werden. 
Dank der vereinfachten Struktur kann schnell und einfach auf die notwendigen Informationen zugegriffen werden.

getItemsFromList

Diese Funktion ist ähnlich wie die vorherige und erwartet ebenfalls einen Parameter „Json“. 
Hier wird der Inhalt einer Alexa Liste in einem einfacheren Format in einem Array gespeichert und zurückgegeben. 
Diese Funktion wird benötigt, um auf die Elemente der Liste "Lern Fortschritte" zuzugreifen und den Nutzer über den Lernfortschritt zu informieren oder den Lernfortschritt zu aktualisieren.
Dieser Inhalt wird ebenfalls in einer globalen Variable gespeichert. 

checkToDoList

Diese Funktion erwartet zwei Parameter „list“ und „compareName“. 
Das Ziel dieser Funktion ist es herauszufinden, ob die angeforderte Liste bereits existiert oder nicht. 
Als Rückgabewert wird ein Boolean erwartet. 
Diese Funktion hilft dabei festzulegen, ob die Liste für die Lernfortschritte schon erstellt worden ist oder nicht. 
Wenn dies schon der Fall ist, wird die Liste nicht nochmal generiert.

GetIdOfList

Diese Funktion erwartet zwei Parameter „list“ und „compareName“. 
Der Rückgabewert ist die ID der erforderten Liste. 
Diese ID wird benötigt, um über die List Api Operationen ausführen zu können. 
Die Listen in der Alexa Umgebung werden über Ihre ID angesprochen.

GetIdOfItem

Diese Funktion ist ähnlich wie die vorherige und erwartet ebenfalls zwei Parameter „list“ und „compareName“. 
Hier wird jedoch die ID der Elemente zurückgegeben. 
Der Grund ist exakt der gleiche wie in der Funktion vorher, nur bezieht sich dies auf die Elemente.
