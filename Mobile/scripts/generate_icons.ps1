Add-Type -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Drawing.Drawing2D;
using System.Runtime.InteropServices;
using System.Collections.Generic;

public class IconHelper
{
    private static bool IsWhite(byte[] pixels, int x, int y, int w)
    {
        int idx = (y * w + x) * 4;
        byte b = pixels[idx];
        byte g = pixels[idx + 1];
        byte r = pixels[idx + 2];
        return (r > 205 && g > 205 && b > 205);
    }

    public static void Process(string srcPath, string assetsDir)
    {
        using (Bitmap src = new Bitmap(srcPath))
        {
            int w = src.Width;
            int h = src.Height;

            BitmapData srcData = src.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
            byte[] pixels = new byte[w * h * 4];
            Marshal.Copy(srcData.Scan0, pixels, 0, pixels.Length);
            src.UnlockBits(srcData);

            bool[] isOuter = new bool[w * h];
            Queue<int> q = new Queue<int>();

            int[] corners = new int[] { 0, w - 1, (h - 1) * w, (h - 1) * w + (w - 1) };
            for (int i = 0; i < corners.Length; i++)
            {
                int c = corners[i];
                int cx = c % w;
                int cy = c / w;
                if (IsWhite(pixels, cx, cy, w))
                {
                    q.Enqueue(c);
                    isOuter[c] = true;
                }
            }

            int[] dx = new int[] { 1, -1, 0, 0 };
            int[] dy = new int[] { 0, 0, 1, -1 };

            while (q.Count > 0)
            {
                int curr = q.Dequeue();
                int cx = curr % w;
                int cy = curr / w;
                for (int i = 0; i < 4; i++)
                {
                    int nx = cx + dx[i];
                    int ny = cy + dy[i];
                    if (nx >= 0 && nx < w && ny >= 0 && ny < h)
                    {
                        int nidx = ny * w + nx;
                        if (!isOuter[nidx] && IsWhite(pixels, nx, ny, w))
                        {
                            isOuter[nidx] = true;
                            q.Enqueue(nidx);
                        }
                    }
                }
            }

            byte[][] rowColors = new byte[h][];
            for (int y = 0; y < h; y++)
            {
                int leftX = -1;
                for (int x = 0; x < w; x++)
                {
                    if (!isOuter[y * w + x])
                    {
                        leftX = x;
                        break;
                    }
                }
                if (leftX >= 0)
                {
                    int idx = (y * w + leftX) * 4;
                    rowColors[y] = new byte[] { pixels[idx], pixels[idx + 1], pixels[idx + 2], 255 };
                }
                else
                {
                    float t = (float)y / (float)h;
                    byte r = (byte)(18 * (1 - t) + 0 * t);
                    byte g = (byte)(88 * (1 - t) + 55 * t);
                    byte b = (byte)(176 * (1 - t) + 137 * t);
                    rowColors[y] = new byte[] { b, g, r, 255 };
                }
            }

            // Create full-bleed bitmap (no white corners)
            using (Bitmap fullBleed = new Bitmap(w, h, PixelFormat.Format32bppArgb))
            {
                BitmapData fbData = fullBleed.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
                byte[] fbPixels = new byte[w * h * 4];
                for (int y = 0; y < h; y++)
                {
                    for (int x = 0; x < w; x++)
                    {
                        int idx = (y * w + x) * 4;
                        if (isOuter[y * w + x])
                        {
                            fbPixels[idx] = rowColors[y][0];
                            fbPixels[idx + 1] = rowColors[y][1];
                            fbPixels[idx + 2] = rowColors[y][2];
                            fbPixels[idx + 3] = 255;
                        }
                        else
                        {
                            fbPixels[idx] = pixels[idx];
                            fbPixels[idx + 1] = pixels[idx + 1];
                            fbPixels[idx + 2] = pixels[idx + 2];
                            fbPixels[idx + 3] = 255;
                        }
                    }
                }
                Marshal.Copy(fbPixels, 0, fbData.Scan0, fbPixels.Length);
                fullBleed.UnlockBits(fbData);

                // 1. icon.png (1024x1024)
                using (Bitmap icon1024 = new Bitmap(1024, 1024, PixelFormat.Format32bppArgb))
                using (Graphics g = Graphics.FromImage(icon1024))
                {
                    g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                    g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                    g.SmoothingMode = SmoothingMode.HighQuality;
                    g.DrawImage(fullBleed, 0, 0, 1024, 1024);
                    icon1024.Save(System.IO.Path.Combine(assetsDir, "icon.png"), ImageFormat.Png);
                }

                // 2. android-icon-background.png (1024x1024 full gradient)
                using (Bitmap bg1024 = new Bitmap(1024, 1024, PixelFormat.Format32bppArgb))
                using (Graphics g = Graphics.FromImage(bg1024))
                {
                    using (LinearGradientBrush brush = new LinearGradientBrush(
                        new Point(0, 0), new Point(0, 1024),
                        Color.FromArgb(255, 18, 88, 176),
                        Color.FromArgb(255, 0, 55, 137)))
                    {
                        g.FillRectangle(brush, 0, 0, 1024, 1024);
                    }
                    bg1024.Save(System.IO.Path.Combine(assetsDir, "android-icon-background.png"), ImageFormat.Png);
                }

                // 3. android-icon-foreground.png (1024x1024, scaled down fullBleed so entire artwork is in safe circle)
                // Safe circle in 1024x1024 has diameter 682px. Scale fullBleed to ~720x720 centered.
                using (Bitmap fg1024 = new Bitmap(1024, 1024, PixelFormat.Format32bppArgb))
                using (Graphics g = Graphics.FromImage(fg1024))
                {
                    g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                    g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                    g.SmoothingMode = SmoothingMode.HighQuality;
                    g.Clear(Color.Transparent);

                    int targetSize = 720;
                    int offset = (1024 - targetSize) / 2;
                    g.DrawImage(fullBleed, offset, offset, targetSize, targetSize);
                    fg1024.Save(System.IO.Path.Combine(assetsDir, "android-icon-foreground.png"), ImageFormat.Png);
                }

                // 4. splash-icon.png (1024x1024)
                using (Bitmap splash1024 = new Bitmap(1024, 1024, PixelFormat.Format32bppArgb))
                using (Graphics g = Graphics.FromImage(splash1024))
                {
                    g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                    g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                    g.SmoothingMode = SmoothingMode.HighQuality;
                    g.DrawImage(fullBleed, 0, 0, 1024, 1024);
                    splash1024.Save(System.IO.Path.Combine(assetsDir, "splash-icon.png"), ImageFormat.Png);
                }

                // 5. favicon.png (48x48)
                using (Bitmap fav = new Bitmap(48, 48, PixelFormat.Format32bppArgb))
                using (Graphics g = Graphics.FromImage(fav))
                {
                    g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                    g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                    g.SmoothingMode = SmoothingMode.HighQuality;
                    g.DrawImage(fullBleed, 0, 0, 48, 48);
                    fav.Save(System.IO.Path.Combine(assetsDir, "favicon.png"), ImageFormat.Png);
                }
            }
        }
    }
}
"@ -ReferencedAssemblies System.Drawing

[IconHelper]::Process('C:\Users\HP\Smart-Agent\Mobile\assets\images\appIcon.png', 'C:\Users\HP\Smart-Agent\Mobile\assets')
Write-Output "SUCCESS: Icon assets generated successfully."
