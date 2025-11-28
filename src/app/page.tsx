
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Header from '@/components/common/header';
import Logo from '@/components/common/logo';
import { ArrowRight, Scan, Shirt, Wand2, Presentation, Video } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="py-16 sm:py-20 md:py-24 lg:py-28 xl:py-32">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                {/* Left Content */}
                <div className="space-y-6 lg:space-y-8 animate-fade-in text-center lg:text-left">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                    Redefine Your Style with AI.
                  </h1>
                  <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
                    See yourself in new outfits instantly. Your personal stylist is just a click away.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
                    <Button 
                      asChild 
                      size="lg" 
                      className="shadow-lg transition-all hover:scale-105 hover:shadow-xl h-12 text-base"
                    >
                      <Link href="/dashboard">
                        Try For Free <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    <Button 
                      asChild 
                      size="lg" 
                      variant="outline" 
                      className="transition-all hover:scale-105 h-12 text-base"
                    >
                      <Link href="/business/dashboard">
                        Explore Business Tools
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Right Image */}
                <div className="relative w-full max-w-md mx-auto lg:max-w-none animate-fade-in-delay">
                  <div className="relative aspect-square rounded-full overflow-hidden shadow-2xl shadow-primary/10 border-8 border-background">
                    <Image
                      src="https://images.unsplash.com/photo-1552664199-fd31f7431a55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxzdHlsaXNoJTIwd29tYW4lMjBtaW5pbWFsfGVufDB8fHx8MTc2NzE1ODIzNnww&ixlib=rb-4.1.0&q=80&w=1080"
                      alt="A stylish woman in a bright, modern outfit looking at her phone"
                      fill
                      priority
                      className="object-cover"
                      data-ai-hint="stylish woman"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="py-20 sm:py-24 lg:py-28">
              {/* Section Header */}
              <div className="text-center mb-16 max-w-3xl mx-auto">
                <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                  A Magical Experience
                </h2>
                <p className="text-lg text-muted-foreground">
                  Simple, intuitive, and powerful.
                </p>
              </div>

              {/* Feature Cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                <div className="space-y-4 p-6 rounded-2xl bg-background/50 hover:bg-background transition-all hover:shadow-xl hover:scale-105">
                  <div className="w-12 h-12 flex items-center justify-center bg-primary/10 text-primary rounded-xl">
                    <Shirt className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold">1. Upload Your Closet</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Quickly digitize your wardrobe by adding photos of yourself and your clothing items.
                  </p>
                </div>

                <div className="space-y-4 p-6 rounded-2xl bg-background/50 hover:bg-background transition-all hover:shadow-xl hover:scale-105">
                  <div className="w-12 h-12 flex items-center justify-center bg-primary/10 text-primary rounded-xl">
                    <Scan className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold">2. Select & Combine</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Choose a photo of yourself and mix-and-match any items from your virtual closet.
                  </p>
                </div>

                <div className="space-y-4 p-6 rounded-2xl bg-background/50 hover:bg-background transition-all hover:shadow-xl hover:scale-105 sm:col-span-2 lg:col-span-1">
                  <div className="w-12 h-12 flex items-center justify-center bg-primary/10 text-primary rounded-xl">
                    <Wand2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold">3. Generate Your Look</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Our AI generates a realistic image of you wearing the selected outfit in seconds.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="py-6 sm:py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Logo />
            <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-right space-y-1">
              <p>&copy; {new Date().getFullYear()} StyleAI Studio. All rights reserved.</p>
              <p>Powered by Google and Gemini</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
