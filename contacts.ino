//  * @file Whatsapp_Message.ino
//  * @author Hafidh Hidayat (hafidhhidayat@hotmail.com)
//  * @brief Example WhatsApp Messages
//  *
//  * @copyright Copyright (c) 2022
//  *
//  * Github :
//  * https://github.com/hafidhh
//  * https://github.com/hafidhh/Callmebot-ESP32
//  */
#include <Arduino.h>
#include <WiFi.h>
#include <Callmebot_ESP32.h>
#define BUTTON_PIN 2
#define SPEAKER_PIN 25 // GPIO pin connected to the DAC

// Define the frequency for the beep sound
#define BEEP_FREQUENCY 1000 // in Hertz

bool buttonState = HIGH;
bool lastButtonState = HIGH;

unsigned long lastDebounceTime = 0;
unsigned long debounceDelay = 25;
unsigned long lastButtonPressTime = 0;

const unsigned long doublePressThreshold = 300;

const char *ssid = "dedoviq";
const char *password = "12345678";
// Note :
// phoneNumber : Indonesia +62, Example: "+62897461238"
// apiKey : Follow instruction on https://www.callmebot.com/blog/free-api-whatsapp-messages/
String phoneNumber = "+359886745889";
String phoneNumber1 = "+359894678376";
String apiKey = "5047291";
String apiKey1 = "7527383";
String messsage = "Baba Vanche iska da te chue";
String messsage1 = "Obadi mi se";


void setup()
{
  Serial.begin(115200);
    
  WiFi.begin(ssid, password);
  Serial.println("Connecting");
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Connected to WiFi network with IP Address: ");
  Serial.println(WiFi.localIP());

    pinMode(BUTTON_PIN, INPUT_PULLUP);
    pinMode(SPEAKER_PIN, OUTPUT);

  // Whatsapp Message
  // Callmebot.whatsappMessage(phoneNumber1, apiKey1, messsage);
  // Serial.println(Callmebot.debug());
}

void loop()
{
  int reading = digitalRead(BUTTON_PIN);
    if (digitalRead(BUTTON_PIN) == LOW) {
    // Button is pressed, generate beep sound
    tone(SPEAKER_PIN, BEEP_FREQUENCY);
    delay(100); // Adjust this delay to control the beep duration
    noTone(SPEAKER_PIN); // Turn off the beep sound
  }
    if (reading != lastButtonState) {
    lastDebounceTime = millis();
    }
        if ((millis() - lastDebounceTime) < debounceDelay) {
        if (reading != buttonState) {
            buttonState = reading;
        if (buttonState == LOW && lastButtonState == HIGH) {
          // Single press detected
            Callmebot.whatsappMessage(phoneNumber1, apiKey1, messsage1);
        }
        else if (millis() - lastButtonPressTime < doublePressThreshold) {
          // Double press detected
          Callmebot.whatsappMessage(phoneNumber, apiKey, messsage);
        }  
      lastButtonPressTime = millis();
        
     }
      
    }        
  lastButtonState = reading;
}
