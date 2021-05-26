#include <iostream>
#include <string>

#include <WiFi.h>
#include <WebServer.h>
#include <ESPmDNS.h>
#include <FastLED.h>
#include <stdlib.h>

#include "conf.h" // SSID & PASS

#define NUM_LEDS 256
#define DATA_PIN 13

const char* host     = "leds";
const char* ssid     = WIFI_SSID;
const char* password = WIFI_PASS;

String hexChars = "0123456789ABCDEF";

WebServer server(80);

CRGB leds[NUM_LEDS];

void setup(void) {
  Serial.begin(115200);
  Serial.println("\nBooting...");

  LEDS.addLeds<WS2812,DATA_PIN,GRB>(leds,NUM_LEDS);
  LEDS.setBrightness(100);

  WiFi.mode(WIFI_AP_STA);
  WiFi.begin(ssid, password);

  if (WiFi.waitForConnectResult() == WL_CONNECTED) {
    MDNS.begin(host);

    server.on("/", HTTP_GET, []() {
      server.sendHeader("Connection", "close");
//      String body = "";
//      for(int i = 0, i < NUM_LEDS) {
//        CRGB color = leds[i];
//        color.red;
//        body.append("")
//      }

      server.send(200, "text/html", "blah");
    });

    server.on("/", HTTP_POST, []() {
      server.sendHeader("Connection", "close");

      if (server.hasArg("data")) {
        String dataString = server.arg("data");

        int i = 0;
        int led_i = 0;
        while (i < dataString.length() && led_i <= NUM_LEDS) {
          char r0 = dataString.charAt(i++);
          char r1 = dataString.charAt(i++);

          char g0 = dataString.charAt(i++);
          char g1 = dataString.charAt(i++);

          char b0 = dataString.charAt(i++);
          char b1 = dataString.charAt(i++);

          char colorBuf[16];
          sprintf(colorBuf, "%d: #%c%c%c%c%c%c", led_i, r0, r1, g0, g1, b0, b1);
          Serial.print(colorBuf);

          char intBuf[16];

          int ri0 = hexChars.indexOf(r0);
          int ri1 = hexChars.indexOf(r1);

          int gi0 = hexChars.indexOf(g0);
          int gi1 = hexChars.indexOf(g1);

          int bi0 = hexChars.indexOf(b0);
          int bi1 = hexChars.indexOf(b1);

          sprintf(intBuf, "   %d,%d %d,%d %d,%d", ri0, ri1, gi0, gi1, bi0, bi1);
          Serial.print(intBuf);

          unsigned long red   = (ri0 << 4) | ri1;
          unsigned long green = (gi0 << 4) | gi1;
          unsigned long blue  = (bi0 << 4) | bi1;

          char strBuf[16];
          sprintf(strBuf, "   rgb(%d,%d,%d)", red, green, blue);
          Serial.println(strBuf);

          leds[led_i++] = CRGB { red, green, blue };
        }

        Serial.println("Updating leds");
        FastLED.show();
      } else {
        Serial.println("No data.");
      }

      server.send(200, "text/html", "success");
    });

    server.begin();

    MDNS.addService("http", "tcp", 80);

    Serial.printf("Server up! http://%s.local\n", host);
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("WiFi Failed");
  }
}

void loop(void) {
  server.handleClient();
  delay(1);
}
