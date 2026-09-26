import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/dbConnect'
import cloudinary from '@/lib/cloudinary'
import { User } from '@/models/User'

interface JwtPayload {
  id: string
  email: string
}

function getUserId(request: NextRequest) {
  const token = request.cookies.get('app_session')?.value || request.cookies.get('token')?.value
  if (!token) return null

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload
    return decoded.id || null
  } catch {
    return null
  }
}

function publicUser(user: InstanceType<typeof User>) {
  return {
    _id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    avatar: user.avatar,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

export async function GET(request: NextRequest) {
  const userId = getUserId(request)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await dbConnect()
    const user = await User.findById(userId)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    return NextResponse.json({ success: true, user: publicUser(user) })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Unable to load profile' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const userId = getUserId(request)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await dbConnect()
    const user = await User.findById(userId)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const formData = await request.formData()
    const fullName = formData.get('fullName')
    const avatar = formData.get('avatar')

    if (typeof fullName === 'string') {
      const trimmedName = fullName.trim()
      if (!trimmedName) return NextResponse.json({ error: 'Full name is required' }, { status: 400 })
      user.fullName = trimmedName
    }

    if (avatar instanceof globalThis.File && avatar.size > 0) {
      if (!avatar.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Profile image must be an image file' }, { status: 400 })
      }
      if (avatar.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'Profile image must be smaller than 5 MB' }, { status: 400 })
      }

      const buffer = Buffer.from(await avatar.arrayBuffer())
      const uploadResult = await new Promise<{ secure_url?: string }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'nextjs_profiles', resource_type: 'image' },
          (error, result) => {
            if (error || !result) {
              reject(error || new Error('Cloudinary returned no avatar result'))
              return
            }
            resolve(result)
          },
        )
        uploadStream.end(buffer)
      })

      if (!uploadResult.secure_url) {
        return NextResponse.json({ error: 'Cloudinary did not return an avatar URL' }, { status: 502 })
      }

      user.avatar = uploadResult.secure_url
    }

    await user.save()
    return NextResponse.json({ success: true, user: publicUser(user) })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Unable to update profile' }, { status: 500 })
  }
}
