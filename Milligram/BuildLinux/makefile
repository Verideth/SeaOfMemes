# Build Debug and Release versions of libraries

LIBS = mg2D mg3D mgGUI mgPlatform mgUtil JpegLib LibPNG Ogg Vorbis ZLib FreeType #LibPNG

all: $(LIBS)

$(LIBS):
	@$(MAKE) --directory=../$@/BuildLinux

