TARGET = SeaOfMemes

SOURCE = ../Source
INCDIRS = -I/usr/include -I/usr/local/include -I/user/include/GL -I./ -I$(SOURCE) -I../../../Milligram/

SEAOFMEMES = SeaOfMemes.o 

GUI = GUI/SpeedUI.o GUI/HelpUI.o

LANDSCAPE = Landscape/Landscape.o Landscape/PlanetLandscape.o Landscape/PlanetTerrain.o \
	Landscape/TerrainCell.o

SOLARSYSTEM = SolarSystem/Asteroid.o SolarSystem/Belt.o SolarSystem/Earth.o SolarSystem/Habitat.o \
	SolarSystem/Moon.o SolarSystem/NebulaSky.o SolarSystem/Planet.o SolarSystem/Ring.o \
	SolarSystem/SolarSystem.o SolarSystem/VertexPlanet.o
						  
UTIL = Util/VertexTerrain.o

FILES = $(SEAOFMEMES) $(GUI) $(LANDSCAPE) $(SOLARSYSTEM) $(UTIL)
DIRLIST = GUI Landscape SolarSystem Util

# Build Milligram Application
CC = g++
RELEASEFLAGS = -O3 -Wno-invalid-offsetof
DEBUGFLAGS = -g3 -O0 -fno-inline -Wno-invalid-offsetof

LIBS = -lX11 -lGL -lm -lrt -lpthread
DEBUGLIBDIRS = -L../../../Milligram/BuildLinux/Debug
RELEASELIBDIRS = -L../../../Milligram/BuildLinux/Release
FRAMEWORK = -lmg3D -lmgPlatform -lmg2D -lmgGUI -lmgUtil -lJpegLib -lLibPNG -lZLib -lFreeType


all: debug release

debug: debugdirs Debug/$(TARGET)

release: releasedirs Release/$(TARGET)

DEBUGFILES = $(addprefix Debug/, $(FILES))
RELEASEFILES = $(addprefix Release/, $(FILES))

#directories
debugdirs:
	@mkdir -p Debug $(addprefix Debug/, $(DIRLIST))

releasedirs:
	@mkdir -p Release $(addprefix Release/, $(DIRLIST))

# compilation rules
Debug/%.o: $(SOURCE)/%.c
	@echo "$(CC) -o $@"
	@$(CC) $(DEBUGFLAGS) $(INCDIRS) $(DEFINE) -c $< -o $@

Debug/%.o: $(SOURCE)/%.cpp
	@echo "$(CC) -o $@"
	@$(CC) $(DEBUGFLAGS) $(INCDIRS) $(DEFINE) -c $< -o $@

Release/%.o: $(SOURCE)/%.c
	@echo "$(CC) -o $@"
	@$(CC) $(RELEASEFLAGS) $(INCDIRS) $(DEFINE) -c $< -o $@

Release/%.o: $(SOURCE)/%.cpp
	@echo "$(CC) -o $@"
	@$(CC) $(RELEASEFLAGS) $(INCDIRS) $(DEFINE) -c $< -o $@

Debug/$(TARGET): $(DEBUGFILES)
	@echo "Link $@"
	@$(CC) $(DEBUGLIBDIRS) -o Debug/$(TARGET) $(DEBUGFILES) $(FRAMEWORK) $(LIBS)

Release/$(TARGET): $(RELEASEFILES)
	@echo "Link $@"
	@$(CC) $(RELEASELIBDIRS) -o Release/$(TARGET) $(RELEASEFILES) $(FRAMEWORK) $(LIBS)

clean: 
	-rm -r -f Debug
	-rm -r -f Release


