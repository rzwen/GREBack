#include "bmp.h"		//	Simple .bmp library
#include<iostream>
#include <fstream>
#include <string>
#include <vector>

using namespace std;

#define Baseline 30.0
#define Focal_Length 100
#define Image_Width 35.0
#define Image_Height 35.0
#define Resolution_Row 512
#define Resolution_Col 512
#define View_Grid_Row 9
#define View_Grid_Col 9

struct Point3d
{
	double x;
	double y;
	double z;
	Point3d(double x_, double y_, double z_) :x(x_), y(y_), z(z_) {}
};

struct Point2d
{
	double x;
	double y;
	Point2d(double x_, double y_) :x(x_), y(y_) {}
};


int main(int argc, char** argv)
{
	if(argc < 5 || argc > 6)
	{
		cout << "Arguments prompt: viewSynthesis.exe <LF_dir> <X Y Z> OR: viewSynthesis.exe <LF_dir> <X Y Z> <focal_length>" << endl;
		return 0;
	}
	string LFDir = argv[1];
	double Vx = stod(argv[2]), Vy = stod(argv[3]), Vz = stod(argv[4]);
	double targetFocalLen = 100; // default focal length for "basic requirement" part
	if(argc == 6)
	{
		targetFocalLen = stod(argv[5]);
	}
	

	vector<Bitmap> viewImageList;
	//! loading light field views
	for (int i = 0; i < View_Grid_Col*View_Grid_Row; i++)
	{
		char name[128];
		sprintf(name, "/cam%03d.bmp", i);
		string filePath = LFDir + name;
		Bitmap view_i(filePath.c_str());
		viewImageList.push_back(view_i);
	}
	Bitmap targetView(Resolution_Col, Resolution_Row);
	cout << "Synthesizing image from viewpoint: (" << Vx << "," << Vy << "," << Vz << ") with focal length: " << targetFocalLen << endl;
	//! resample pixels of the target view one by one
	for (int r = 0; r < Resolution_Row; r++)
	{
		int k = Resolution_Row - r;
		double ty = (double) k/ Resolution_Row;
		double yx = Vy + (35*ty - 35 / 2) * Vz / Focal_Length ;
		double y = 120-yx;
		double yi = (double)y / 30;
		int y1 = floor(y / 30);
		int y2 = ceil(y / 30);
		for (int c = 0; c < Resolution_Col; c++)
		{
			Point3d rayRGB(0, 0, 0);
			//! resample the pixel value of this ray: TODO

			double tx = (double) c / Resolution_Col;
			double xv = ( 35 * tx - 35 / 2) * Vz / Focal_Length + Vx;
			double x = 120+xv;
			double xi = (double)x / 30;
			int x1 = floor(x / 30);
			int x2 = ceil(x / 30);
			
			//Emhancement part 1, for pix outside range
			if (xi > 8 || yi>8 || xi<0||yi<0) {
				targetView.setColor(c, k, (unsigned char)0, (unsigned char)0, (unsigned char)0);
				continue;
			}
			//cout << x1 << " " <<xi<<" " << x2 << " " << y1 <<" " <<yi<< " " << y2 << "\n";

			

			Color c11 = viewImageList[y1 * 9 + x1].getData()[(c + k * Resolution_Col)];
			Color c12 = viewImageList[y1 * 9 + x2].getData()[(c + k * Resolution_Col)];
			Color c21 = viewImageList[y2 * 9 + x1].getData()[(c + k * Resolution_Col)];
			Color c22 = viewImageList[y2 * 9 + x2].getData()[(c + k * Resolution_Col)];
			/*
			if (y1 == 0) {
				c11 = source->getData()[(x1 + (sh - 1 - y1) * sw)];
				c12 = source->getData()[(x1 + (sh - 1 - y2) * sw)];
				c21 = source->getData()[(x2 + (sh - 1 - y1) * sw)];
				c22 = source->getData()[(x2 + (sh - 1 - y2) * sw)];
			}*/
			if (x1 == x2&&y1==y2) {
				targetView.setColor(c, k, (unsigned char)c11.R, (unsigned char)c11.G, (unsigned char)c11.B);
				continue;
			}
			else if (x1 == x2) {
				rayRGB.x = c11.R * fabs(yi - y2) + c21.R * fabs(yi - y2);
				rayRGB.y = c11.G * fabs(yi - y2) + c21.G * fabs(yi - y2);
				rayRGB.z = c11.B * fabs(yi - y2) + c21.B * fabs(yi - y2);
			}
			else if (y1 == y2) {
				rayRGB.x = c11.R * fabs(xi - x2) + c21.R * fabs(xi - x2);
				rayRGB.y = c11.G * fabs(xi - x2) + c21.G * fabs(xi - x2);
				rayRGB.z = c11.B * fabs(xi - x2) + c21.B * fabs(xi - x2);
			}
			else {
				rayRGB.x = c11.R * fabs(xi - x2) * fabs(yi - y2) + c12.R * fabs(xi - x2) * fabs(yi - y1) + c21.R * fabs(xi - x1) * fabs(yi - y2) + c22.R * fabs(xi - x1) * fabs(yi - y1);
				rayRGB.y = c11.G * fabs(xi - x2) * fabs(yi - y2) + c12.G * fabs(xi - x2) * fabs(yi - y1) + c21.G * fabs(xi - x1) * fabs(yi - y2) + c22.G * fabs(xi - x1) * fabs(yi - y1);
				rayRGB.z = c11.B * fabs(xi - x2) * fabs(yi - y2) + c12.B * fabs(xi - x2) * fabs(yi - y1) + c21.B * fabs(xi - x1) * fabs(yi - y2) + c22.B * fabs(xi - x1) * fabs(yi - y1);
			}
			//! record the resampled pixel value
			targetView.setColor(c, k, (unsigned char)rayRGB.x, (unsigned char)rayRGB.y, (unsigned char)rayRGB.z);
			//targetView.setColor(c, r, (unsigned char) rayRGB.x, (unsigned char) rayRGB.y, (unsigned char) rayRGB.z);
		}
	}
	string savePath = "newView.bmp";
	targetView.save(savePath.c_str());
	cout << "Result saved!" << endl;
	return 0;
}
