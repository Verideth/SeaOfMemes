/*
  Copyright (C) 1995-2013 by Michael J. Goodfellow

  This source code is distributed for free and may be modified, redistributed, and
  incorporated in other projects (commercial, non-commercial and open-source)
  without restriction.  No attribution to the author is required.  There is
  no requirement to make the source code available (no share-alike required.)

  This source code is distributed "AS IS", with no warranty expressed or implied.
  The user assumes all risks related to quality, accuracy and fitness of use.

  Except where noted, this source code is the sole work of the author, but it has 
  not been checked for any intellectual property infringements such as copyrights, 
  trademarks or patents.  The user assumes all legal risks.  The original version 
  may be found at "http://www.sea-of-memes.com".  The author is not responsible 
  for subsequent alterations.

  Retain this copyright notice and add your own copyrights and revisions above
  this notice.
*/

#ifndef MGCONTROLLISTENER_H
#define MGCONTROLLISTENER_H

/*
  Abstract interface which delivers changes to control position, size, visibility, etc.
*/
class mgControlListener
{
public:
  // control resize
  virtual void controlResize(
    void* source) = 0;

  // control moved
  virtual void controlMove(
    void* source) = 0;

  // control shown
  virtual void controlShow(
    void* source) = 0;

  // control hidden
  virtual void controlHide(
    void* source) = 0;

  // control enabled
  virtual void controlEnable(
    void* source) = 0;

  // control disabled
  virtual void controlDisable(
    void* source) = 0;

  // control deleted
  virtual void controlDelete(
    void* source) = 0;

  // child control added
  virtual void controlAddChild(
    void* source) = 0;

  // child control removed
  virtual void controlRemoveChild(
    void* source) = 0;
};

#endif
