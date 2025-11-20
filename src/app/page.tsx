import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Palette, Scan } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Header from '@/components/common/header';
import Logo from '@/components/common/logo';

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero');

  return (
    <div className="flex flex-col min-h-dvh bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      <main className="flex-1">
        <section className="relative w-full h-[70vh] md:h-[85vh] flex items-center justify-center text-center overflow-hidden">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              priority
              data-ai-hint={heroImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
          
          {/* Decorative elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
          
          <div className="relative z-10 p-6 max-w-5xl mx-auto animate-fade-in">
            <div className="inline-block mb-4 px-4 py-2 bg-accent/90 text-accent-foreground rounded-full text-sm font-semibold">
              ✨ AI-Powered Fashion Technology
            </div>
            <h1 className="text-5xl md:text-7xl font-headline font-bold tracking-tight text-white leading-tight">
              Redefine Your Style
              <span className="block mt-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                with AI
              </span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Experience the future of fashion with personalized recommendations, virtual try-ons, 
              and AI-powered styling tools that understand your unique taste.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105">
                <Link href="/dashboard">
                  <Bot className="mr-2 h-5 w-5" />
                  Get Started Free
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 text-white backdrop-blur-sm transition-all duration-300 hover:scale-105">
                <Link href="/business/dashboard">
                  <Palette className="mr-2 h-5 w-5" />
                  For Businesses
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 md:py-28 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 animate-slide-up">
              <div className="inline-block mb-4 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                Features
              </div>
              <h2 className="text-4xl md:text-5xl font-headline font-bold text-foreground">
                Everything You Need
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Powerful AI tools designed for fashion enthusiasts and businesses alike.
              </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <Card className="group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 border-2 hover:border-primary/50 hover:-translate-y-2 bg-card/50 backdrop-blur-sm">
                <CardHeader className="items-center text-center space-y-4">
                  <div className="p-5 bg-gradient-to-br from-primary to-primary/70 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Bot className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl">AI Style Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground leading-relaxed">Get personalized outfit suggestions based on your body type, color harmony, and unique style preferences powered by advanced AI.</p>
                </CardContent>
              </Card>
              <Card className="group hover:shadow-2xl hover:shadow-accent/10 transition-all duration-300 border-2 hover:border-accent/50 hover:-translate-y-2 bg-card/50 backdrop-blur-sm">
                <CardHeader className="items-center text-center space-y-4">
                  <div className="p-5 bg-gradient-to-br from-accent to-accent/70 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Scan className="w-10 h-10 text-accent-foreground" />
                  </div>
                  <CardTitle className="text-2xl">Virtual Try-On</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground leading-relaxed">Visualize outfits, hairstyles, and accessories with our cutting-edge generative AI technology for realistic virtual try-ons.</p>
                </CardContent>
              </Card>
              <Card className="group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 border-2 hover:border-primary/50 hover:-translate-y-2 bg-card/50 backdrop-blur-sm">
                <CardHeader className="items-center text-center space-y-4">
                  <div className="p-5 bg-gradient-to-br from-primary/80 to-accent/80 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Palette className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl">Visual Catalogs</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                 <p className="text-muted-foreground leading-relaxed">Businesses can automatically create stunning, interactive product catalogs that engage customers and drive sales.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="py-8 bg-gradient-to-b from-muted/50 to-muted border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <Logo />
          <p className="mt-4 text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} StyleAI Studio. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
