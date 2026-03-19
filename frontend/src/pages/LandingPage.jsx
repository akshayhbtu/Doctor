
import { Badge } from "@/components/ui/badge";
import React, { useState, useEffect } from "react";

import doc1 from '../assets/doc1.png'
import doc5 from '../assets/doc5.png'
import doc3 from '../assets/doc3.png'
import doc4 from '../assets/doc4.png'


import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Calendar,
  Clock,
  Shield,
  MessageSquare,
  Star,
  Users,
  ArrowRight,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Heart,
  Stethoscope,
  Brain,
  Baby,
  Bone,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Hero Slider Data
  const heroSlides = [
    {
      id: 1,
      title: "Expert Cardiologists",
      subtitle: "Heart Health Specialists",
      description:
        "Consult top cardiologists for comprehensive heart care and treatment",
      image:
        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1964&q=80",
      badge: "24/7 Available",
      buttonText: "Book Cardiologist",
      buttonLink: "/doctors/cardiology",
    },
    {
      id: 2,
      title: "Child Specialists",
      subtitle: "Pediatric Care Excellence",
      description:
        "Expert pediatricians dedicated to your child's health and development",
      image:
        "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      badge: "Trusted by Parents",
      buttonText: "Find Pediatrician",
      buttonLink: "/doctors/pediatrics",
    },
    {
      id: 3,
      title: "Neurology Experts",
      subtitle: "Brain & Nervous System",
      description: "Advanced neurological care from experienced specialists",
      image:
        "https://images.unsplash.com/photo-1559757175-5700dde675bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80",
      badge: "Advanced Care",
      buttonText: "Consult Neurologist",
      buttonLink: "/doctors/neurology",
    },
    {
      id: 4,
      title: "Orthopedic Specialists",
      subtitle: "Bone & Joint Health",
      description:
        "Expert care for bones, joints, and musculoskeletal conditions",
      image:
        "https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=2080&q=80",
      badge: "Sports Medicine",
      buttonText: "See Orthopedist",
      buttonLink: "/doctors/orthopedics",
    },
    {
      id: 5,
      title: "Dental Care",
      subtitle: "Smile with Confidence",
      description:
        "Complete dental care from routine checkups to complex procedures",
      image:
        "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      badge: "Painless Treatment",
      buttonText: "Book Dentist",
      buttonLink: "/doctors/dentistry",
    },
  ];

  // Top Doctors Data
  const topDoctors = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      specialty: "Cardiologist",
      experience: "15+ years",
      rating: 4.9,
      patients: 3200,
      image:doc1,
      availability: "Available Today",
      nextSlot: "10:30 AM",
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialty: "Neurologist",
      experience: "12+ years",
      rating: 4.8,
      patients: 2800,
      image:doc5,
      availability: "Available Today",
      nextSlot: "11:15 AM",
    },
    {
      id: 3,
      name: "Dr. Emily Williams",
      specialty: "Pediatrician",
      experience: "10+ years",
      rating: 4.9,
      patients: 4100,
      image:doc3,
      availability: "Available Tomorrow",
      nextSlot: "9:00 AM",
    },
    {
      id: 4,
      name: "Dr. James Rodriguez",
      specialty: "Orthopedic Surgeon",
      experience: "18+ years",
      rating: 4.9,
      patients: 5600,
      image:doc4,
      availability: "Available Today",
      nextSlot: "2:30 PM",
    },
  ];

  // Doctor Categories Data
  const categories = [
    {
      id: 1,
      name: "Cardiology",
      icon: Heart,
      doctors: 45,
      description: "Heart & cardiovascular specialists",
      color: "from-red-400 to-pink-500",
    },
    {
      id: 2,
      name: "Pediatrics",
      icon: Baby,
      doctors: 38,
      description: "Child healthcare experts",
      color: "from-blue-400 to-cyan-500",
    },
    {
      id: 3,
      name: "Neurology",
      icon: Brain,
      doctors: 32,
      description: "Brain & nervous system",
      color: "from-purple-400 to-indigo-500",
    },
    {
      id: 4,
      name: "Orthopedics",
      icon: Bone,
      doctors: 41,
      description: "Bone & joint specialists",
      color: "from-green-400 to-emerald-500",
    },
    {
      id: 5,
      name: "Ophthalmology",
      icon: Eye,
      doctors: 29,
      description: "Eye care & vision",
      color: "from-yellow-400 to-amber-500",
    },
    {
      id: 6,
      name: "General Medicine",
      icon: Stethoscope,
      doctors: 67,
      description: "Primary care physicians",
      color: "from-indigo-400 to-blue-500",
    },
  ];

  const features = [
    {
      icon: Calendar,
      title: "Easy Appointment Booking",
      description: "Book appointments with top doctors in just a few clicks",
    },
    {
      icon: Clock,
      title: "Real-time Availability",
      description: "View and select from available time slots instantly",
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Communicate with doctors in real-time",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your health information is always protected",
    },
    {
      icon: Star,
      title: "Verified Doctors",
      description: "All doctors are verified and approved by our team",
    },
    {
      icon: Users,
      title: "Patient Reviews",
      description: "Read genuine reviews from other patients",
    },
  ];

  const stats = [
    { value: "10,000+", label: "Happy Patients" },
    { value: "500+", label: "Verified Doctors" },
    { value: "50,000+", label: "Appointments" },
    { value: "4.8", label: "Average Rating" },
  ];

  const steps = [
    {
      number: "01",
      title: "Search for Doctors",
      description:
        "Find the right doctor by specialization, location, or experience",
    },
    {
      number: "02",
      title: "Book Appointment",
      description: "Select your preferred date and time slot",
    },
    {
      number: "03",
      title: "Get Confirmed",
      description: "Receive instant confirmation and reminders",
    },
    {
      number: "04",
      title: "Consult & Review",
      description: "Consult with the doctor and leave a review",
    },
  ];

  // Auto-slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length,
    );
  };

  return (
    <div className="min-h-screen">
      {/* Hero Slider Section */}
      <section className="relative h-[600px] lg:h-[700px] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            }`}
          >
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
            </div>

            {/* Content */}
            <div className="relative container h-full flex items-center justify-center">
              <div className="max-w-4xl  text-white">
                <Badge className="mb-4 bg-primary/90 text-white border-0 px-4 py-1 text-sm">
                  {slide.badge}
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold mb-2">
                  {slide.title}
                </h1>
                <h2 className="text-2xl md:text-3xl text-primary-foreground/90 mb-4">
                  {slide.subtitle}
                </h2>
                <p className="text-lg md:text-xl text-gray-200 mb-8">
                  {slide.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="bg-white text-primary hover:bg-blue-500 hover:text-white transition-all duration-300"
                    asChild
                  >
                    <Link to={slide.buttonLink}>
                      {slide.buttonText}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-transparent text-white border-white hover:bg-white hover:text-primary"
                    asChild
                  >
                    <Link to="/doctors/search">View All Doctors</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Slider Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide
                  ? "w-8 bg-primary"
                  : "w-2 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              return (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Doctor Categories Section */}
      <section className="py-20 bg-gradient-to-b from-background to-primary/5">
        <div className="container">
          <div className="text-center mb-12">
            <Badge className="mb-4">Specializations</Badge>
            <h2 className="text-3xl text-blue-600 font-bold mb-4">
              Browse by Category
            </h2>
            <p className="text-gray-700 max-w-2xl mx-auto">
              Find the right specialist for your healthcare needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  to={`/doctors/${category.name.toLowerCase()}`}
                  key={category.id}
                >
                  <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <CardHeader className="relative">
                      {/* <div
                        className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                      /> */}
                      <div className="flex items-start justify-between">
                        <div
                          className={`p-3 rounded-xl bg-gradient-to-t from black  to-gray-300  bg-opacity-10`}
                        >
                          <Icon className="h-8 w-8 text-primary" />
                        </div>
                        <Badge
                          variant="secondary"
                          className="group-hover:bg-primary group-hover:text-white transition-colors"
                        >
                          {category.doctors} Doctors
                        </Badge>
                      </div>
                      <CardTitle className="mt-4 group-hover:text-primary transition-colors">
                        {category.name}
                      </CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="border-t pt-4">
                      <div className="flex items-center text-sm text-muted-foreground group-hover:text-primary transition-colors">
                        <span>View all specialists</span>
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>


      {/* Top Doctors Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <Badge className="mb-4">Our Experts</Badge>
            <h2 className="text-4xl text-blue-600 font-bold mb-4">
              Top Rated Doctors
            </h2>
            <p className="text-gray-700 max-w-2xl mx-auto">
              Meet our highly qualified and experienced medical professionals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topDoctors.map((doctor) => (
              <Card
                key={doctor.id}
                className="group hover:shadow-xl transition-all duration-300"
              >
                <CardHeader className="p-0">
                  <div className="relative h-64 overflow-hidden rounded-t-lg">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-green-500 text-white border-0">
                        {doctor.availability}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <CardTitle className="text-lg">{doctor.name}</CardTitle>
                      <CardDescription>{doctor.specialty}</CardDescription>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="ml-1 text-sm font-medium">
                        {doctor.rating}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{doctor.experience} experience</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{doctor.patients}+ patients</span>
                    </div>
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span>Next slot: {doctor.nextSlot}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline" asChild>
                    <Link to={`/doctor/${doctor.id}`}>
                      Book Appointment
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button size="lg" variant="outline" asChild>
              <Link to="/doctors/search">
                View All Doctors
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-primary/5">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl text-blue-600 font-bold mb-4">
              Why Choose Us
            </h2>
            <p className="text-gray-700 max-w-2xl mx-auto">
              We provide the best healthcare experience with cutting-edge
              technology and verified medical professionals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group border-2 border-gray-200 
      hover:border-transparent 
      hover:bg-gradient-to-r hover:from-blue-400 hover:to-indigo-500 
      hover:scale-102 hover:shadow-xl 
      transition-all duration-300"
              >
                <CardHeader>
                  <feature.icon className="h-10 w-10 text-primary mb-4 group-hover:text-white transition-colors duration-300" />

                  <CardTitle className="group-hover:text-white transition-colors duration-300">
                    {feature.title}
                  </CardTitle>

                  <CardDescription className="group-hover:text-white/90 transition-colors duration-300">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl text-blue-600 font-bold mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Book your appointment in four simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="text-5xl text-gray-500 font-bold mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl text-primary font-semibold mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">{step.description}</p>
                {index < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-1/4 -right-4 h-6 w-6 text-gray-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-primary/5">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl text-blue-600 font-bold mb-4">
              What Our Patients Say
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real stories from real patients who found the right care with us
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star
                        key={j}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    "Excellent experience! Found the perfect doctor for my
                    needs. The booking process was smooth and the consultation
                    was very helpful."
                  </p>
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <span className="text-sm font-medium">JD</span>
                    </div>
                    <div>
                      <p className="font-medium">John Doe</p>
                      <p className="text-xs text-muted-foreground">Patient</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of patients who have found the right healthcare
            provider through our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/register">Create Free Account</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary"
              asChild
            >
              <Link to="/doctors/search">Browse Doctors</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">DA</span>
                </div>
                <span className="font-bold text-xl">DocAppoint</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Making healthcare accessible and convenient for everyone.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/about" className="hover:text-primary">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/doctors" className="hover:text-primary">
                    Find Doctors
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-primary">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="hover:text-primary">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Doctors</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/doctor/register" className="hover:text-primary">
                    Join as Doctor
                  </Link>
                </li>
                <li>
                  <Link to="/doctor/login" className="hover:text-primary">
                    Doctor Login
                  </Link>
                </li>
                <li>
                  <Link to="/doctor/guidelines" className="hover:text-primary">
                    Guidelines
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/privacy" className="hover:text-primary">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-primary">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/refund" className="hover:text-primary">
                    Refund Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} DocAppoint. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
