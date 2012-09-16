/*
  Copyright (C) 1995-2012 by Michael J. Goodfellow

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
#ifndef BVHVIEW_H
#define BVHVIEW_H

#include "MovementApp.h"

class HelpUI;
class BVHFile;
class BVHNode;

class BVHView : public MovementApp
{
public:
  // constructor
  BVHView();

  // destructor
  virtual ~BVHView();

  //--- subclass MovementApp

  // key press
  virtual BOOL moveKeyDown(
    int keyCode,
    int modifiers);

  //--- implement mgApplication interface

  // initialize application
  virtual void appInit();

  // terminate application
  virtual void appTerm();

  // delete any display buffers
  virtual void appDeleteBuffers();

  // create buffers, ready to send to display
  virtual void appCreateBuffers();

  // update animation 
  virtual BOOL appViewAnimate(
    double now,                       // current time (ms)
    double since);                    // milliseconds since last pass
    
  // render the view
  virtual void appViewDraw();

  //--- end of mgApplication interface

protected:
  mgTextureImage* m_limbTexture;
  mgIndexBuffer* m_limbIndexes;
  mgVertexBuffer* m_limbVertexes;

  mgTextureImage* m_floorTexture;
  mgVertexBuffer* m_floorVertexes;

  HelpUI* m_help;

  BVHFile* m_bvh;

  // load texture patterns from options
  virtual void loadTextures();

  // create avatar from bvh hierarchy
  virtual void createAvatar();

  // pose the avatar
  virtual void poseAvatar(
    double* channels);

  // create a joint of avatar
  virtual void createJoint(
    const mgMatrix4& xform, 
    BVHNode* node,
    double*& channels);

  // add limb to figure indexes and vertexes
  virtual void addLimb(
    const mgPoint3& origin,
    const mgPoint3& extent);

  // create vertex buffer for floor
  virtual void createFloor();

  // describe variables.  
  virtual void debugListVariables(
    mgStringArray& varNames,
    mgStringArray& helpText);

  // describe functions.
  virtual void debugListFunctions(
    mgStringArray& funcNames,
    mgStringArray& funcParms,
    mgStringArray& helpText);

  // return value of variable
  virtual void debugGetVariable(
    const char* varName,
    mgString& value);

  // set a variable
  virtual void debugSetVariable(
    const char* varName,
    const char* value,
    mgString& reply);

  // call a function
  virtual void debugCallFunction(
    const char* funcName,
    mgStringArray& args,
    mgString& reply);
};

#endif
